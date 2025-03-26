from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['AUTHOR'] = 'Nikhil Shrivastava'

@app.context_processor
def inject_year():
    return dict(year=datetime.now().year)

@app.context_processor
def inject_author():
    return dict(author=app.config['AUTHOR'])

def get_db():
    db = sqlite3.connect('noticeboard.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('noticeboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        db = get_db()
        # Check if user already exists
        existing_user = db.execute('SELECT id FROM user WHERE username = ?', (username,)).fetchone()
        if existing_user:
            flash('Username already exists. Please choose a different one.')
            return redirect(url_for('register'))
        
        # Create new user
        db.execute('INSERT INTO user (username, password) VALUES (?, ?)',
                  (username, generate_password_hash(password)))
        db.commit()
        
        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        db = get_db()
        user = db.execute('SELECT * FROM user WHERE username = ?', (username,)).fetchone()
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Login successful!')
            return redirect(url_for('noticeboard'))
        else:
            flash('Invalid username or password.')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('You have been logged out.')
    return redirect(url_for('index'))

@app.route('/noticeboard')
def noticeboard():
    if 'user_id' not in session:
        flash('Please log in to view the noticeboard.')
        return redirect(url_for('login'))
    
    db = get_db()
    notices = db.execute('SELECT n.*, u.username FROM notice n JOIN user u ON n.user_id = u.id ORDER BY n.created_at DESC').fetchall()
    return render_template('noticeboard.html', notices=notices)

@app.route('/create-notice', methods=['POST'])
def create_notice():
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in to post a notice.'}), 401
    
    title = request.form.get('title')
    content = request.form.get('content')
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required.'}), 400
    
    db = get_db()
    cur = db.execute(
        'INSERT INTO notice (title, content, user_id) VALUES (?, ?, ?)',
        (title, content, session['user_id'])
    )
    db.commit()
    
    notice = db.execute('SELECT * FROM notice WHERE id = ?', (cur.lastrowid,)).fetchone()
    
    return jsonify({
        'id': notice['id'],
        'title': notice['title'],
        'content': notice['content'],
        'created_at': notice['created_at'],
        'username': session['username']
    })

@app.route('/edit-notice/<int:notice_id>', methods=['PUT'])
def edit_notice(notice_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in to edit a notice.'}), 401
    
    db = get_db()
    notice = db.execute('SELECT * FROM notice WHERE id = ?', (notice_id,)).fetchone()
    if not notice:
        return jsonify({'error': 'Notice not found.'}), 404
    
    if notice['user_id'] != session['user_id']:
        return jsonify({'error': 'You can only edit your own notices.'}), 403
    
    data = request.get_json()
    
    db.execute(
        'UPDATE notice SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        (data.get('title', notice['title']), data.get('content', notice['content']), notice_id)
    )
    db.commit()
    
    updated_notice = db.execute('SELECT * FROM notice WHERE id = ?', (notice_id,)).fetchone()
    return jsonify({
        'id': updated_notice['id'],
        'title': updated_notice['title'],
        'content': updated_notice['content'],
        'updated_at': updated_notice['updated_at']
    })

@app.route('/delete-notice/<int:notice_id>', methods=['DELETE'])
def delete_notice(notice_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in to delete a notice.'}), 401
    
    db = get_db()
    notice = db.execute('SELECT * FROM notice WHERE id = ?', (notice_id,)).fetchone()
    if not notice:
        return jsonify({'error': 'Notice not found.'}), 404
    
    if notice['user_id'] != session['user_id']:
        return jsonify({'error': 'You can only delete your own notices.'}), 403
    
    db.execute('DELETE FROM notice WHERE id = ?', (notice_id,))
    db.commit()
    
    return jsonify({'message': 'Notice deleted successfully.'})

@app.route('/get-notices')
def get_notices():
    if 'user_id' not in session:
        return jsonify({'error': 'Please log in to view notices.'}), 401
    
    db = get_db()
    notices = db.execute('''
        SELECT n.*, u.username 
        FROM notice n 
        JOIN user u ON n.user_id = u.id 
        ORDER BY n.created_at DESC
    ''').fetchall()
    
    notices_list = [{
        'id': notice['id'],
        'title': notice['title'],
        'content': notice['content'],
        'created_at': notice['created_at'],
        'updated_at': notice['updated_at'],
        'username': notice['username'],
        'is_owner': notice['user_id'] == session['user_id']
    } for notice in notices]
    
    return jsonify(notices_list)

if __name__ == '__main__':
    app.run(debug=True)