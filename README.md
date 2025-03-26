# PostItNow

PostItNow is a modern web application that allows users to create, manage, and share notices in a digital noticeboard format. Built with Flask and SQLite, it provides a simple yet efficient platform for posting and managing notices.

## 🚀 Features

- 🔐 **User Authentication**
  - 🔑 Secure user registration and login
  - 🔒 Password hashing for security
  - 🛡️ Session management

- 📌 **Notice Management**
  - 📝 Create new notices with title and content
  - ✏️ Edit your own notices
  - ❌ Delete notices you've created
  - 🔄 Real-time updates (30-second polling)

- 🎨 **User Interface**
  - 🖥️ Clean and responsive design
  - 🏄 Easy-to-use interface
  - ⚡ Dynamic content loading
  - 📱 Mobile-friendly layout

## 🛠️ Technologies Used

- **Backend**
  - 🐍 Flask 3.0.2
  - 🗄️ SQLite3
  - 🛠️ Werkzeug 3.0.1

- **Frontend**
  - 🏗️ HTML5
  - 🎨 CSS3
  - ⚙️ JavaScript (Vanilla)
  - 🔮 Jinja2 Templates

## 📥 Installation

1. Clone the repository:
```bash
git clone git@github.com:nikhil-304/PostItNow.git
cd PostItNow
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate   # On macOS/Linux
venv\Scripts\activate      # On Windows
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python
>>> from app import init_db
>>> init_db()
>>> exit()
```

5. Run the application:
```bash
python app.py
```

The application will be available at [http://localhost:5000](http://localhost:5000).

## 📂 Project Structure

```
PostItNow/
├── app.py              # Main application file
├── models.py           # Database models
├── requirements.txt    # Project dependencies
├── schema.sql         # Database schema
├── static/            # Static files
│   ├── css/          # Stylesheets
│   ├── images/       # Image assets
│   └── js/           # JavaScript files
└── templates/         # HTML templates
    ├── base.html     # Base template
    ├── index.html    # Home page
    ├── login.html    # Login page
    ├── noticeboard.html  # Main noticeboard
    └── register.html # Registration page
```

## 🎯 Usage
1. 🔑 Register a new account or log in with existing credentials.
2. 🏡 Navigate to the noticeboard.
3. 📝 Create new notices using the "Create Notice" button.
4. ✏️ Edit or delete your own notices as needed.
5. 👀 View notices from other users in real-time.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author
**Nikhil Shrivastava** - Full Stack Developer & Software Engineer

🌐 Connect with me:
- 🔗 [GitHub](https://github.com/nikhil-304)
- 🐦 [Twitter](https://x.com/nikhilshri304)
- 💼 [LinkedIn]https://www.linkedin.com/in/nikhil304/)

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
