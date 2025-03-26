document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createNoticeBtn = document.getElementById('create-notice-btn');
    const createNoticeForm = document.getElementById('create-notice-form');
    const noticeForm = document.getElementById('notice-form');
    const cancelNoticeBtn = document.getElementById('cancel-notice');
    const noticesContainer = document.getElementById('notices-container');
    const editNoticeForm = document.getElementById('edit-notice-form');
    const editForm = document.getElementById('edit-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // Event Listeners
    if (createNoticeBtn) {
        createNoticeBtn.addEventListener('click', function() {
            createNoticeForm.classList.remove('hidden');
            editNoticeForm.classList.add('hidden');
        });
    }
    
    if (cancelNoticeBtn) {
        cancelNoticeBtn.addEventListener('click', function() {
            createNoticeForm.classList.add('hidden');
            noticeForm.reset();
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            editNoticeForm.classList.add('hidden');
            editForm.reset();
        });
    }
    
    if (noticeForm) {
        noticeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(noticeForm);
            
            fetch('/create-notice', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                // Add the new notice to the UI
                addNoticeToUI(data);
                
                // Hide the form and reset it
                createNoticeForm.classList.add('hidden');
                noticeForm.reset();
                
                // Remove empty state if it exists
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
            })
            .catch(error => {
                console.error('Error creating notice:', error);
                alert('Failed to create notice. Please try again.');
            });
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const noticeId = document.getElementById('edit-notice-id').value;
            const title = document.getElementById('edit-notice-title').value;
            const content = document.getElementById('edit-notice-content').value;
            
            fetch(`/edit-notice/${noticeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                // Update the notice in the UI
                const noticeCard = document.getElementById(`notice-${noticeId}`);
                if (noticeCard) {
                    const titleElement = noticeCard.querySelector('h3');
                    const contentElement = noticeCard.querySelector('.notice-content');
                    
                    titleElement.textContent = data.title;
                    contentElement.textContent = data.content;
                    
                    // Update timestamp
                    const metaElement = noticeCard.querySelector('.notice-meta');
                    if (metaElement) {
                        metaElement.innerHTML = `Posted by <strong>${document.querySelector('#notice-${noticeId} .notice-meta strong').textContent}</strong> • Updated: ${formatDate(data.updated_at)}`;
                    }
                }
                
                // Hide the form and reset it
                editNoticeForm.classList.add('hidden');
                editForm.reset();
            })
            .catch(error => {
                console.error('Error updating notice:', error);
                alert('Failed to update notice. Please try again.');
            });
        });
    }
    
    // Load notices when the page loads
    if (noticesContainer) {
        loadNotices();
        
        // Set up polling for new notices (every 30 seconds)
        setInterval(loadNotices, 30000);
    }
    
    // Functions
    function loadNotices() {
        fetch('/get-notices')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                
                // Clear the container
                noticesContainer.innerHTML = '';
                
                if (data.length === 0) {
                    // Show empty state
                    noticesContainer.innerHTML = `
                        <div class="empty-state">
                            <p>No notices yet. Be the first to post one!</p>
                        </div>
                    `;
                    return;
                }
                
                // Add each notice to the UI
                data.forEach(notice => {
                    addNoticeToUI(notice);
                });
            })
            .catch(error => {
                console.error('Error loading notices:', error);
            });
    }
    
    function addNoticeToUI(notice) {
        const noticeCard = document.createElement('div');
        noticeCard.className = 'notice-card';
        noticeCard.id = `notice-${notice.id}`;
        
        let timeInfo = `Posted: ${formatDate(notice.created_at)}`;
        if (notice.updated_at) {
            timeInfo = `Posted: ${formatDate(notice.created_at)} • Updated: ${formatDate(notice.updated_at)}`;
        }
        
        noticeCard.innerHTML = `
            <h3>${notice.title}</h3>
            <p class="notice-content">${notice.content}</p>
            <p class="notice-meta">Posted by <strong>${notice.username}</strong> • ${timeInfo}</p>
            ${notice.is_owner ? `
                <div class="notice-actions">
                    <button class="btn btn-primary edit-notice-btn" data-id="${notice.id}" data-title="${notice.title}" data-content="${notice.content}">Edit</button>
                    <button class="btn btn-danger delete-notice-btn" data-id="${notice.id}">Delete</button>
                </div>
            ` : ''}
        `;
        
        noticesContainer.appendChild(noticeCard);
        
        // Add event listeners to the edit and delete buttons
        if (notice.is_owner) {
            const editBtn = noticeCard.querySelector('.edit-notice-btn');
            const deleteBtn = noticeCard.querySelector('.delete-notice-btn');
            
            editBtn.addEventListener('click', function() {
                const noticeId = this.getAttribute('data-id');
                const noticeTitle = this.getAttribute('data-title');
                const noticeContent = this.getAttribute('data-content');
                
                // Fill the edit form with the notice data
                document.getElementById('edit-notice-id').value = noticeId;
                document.getElementById('edit-notice-title').value = noticeTitle;
                document.getElementById('edit-notice-content').value = noticeContent;
                
                // Show the edit form
                editNoticeForm.classList.remove('hidden');
                createNoticeForm.classList.add('hidden');
            });
            
            deleteBtn.addEventListener('click', function() {
                const noticeId = this.getAttribute('data-id');
                
                if (confirm('Are you sure you want to delete this notice?')) {
                    fetch(`/delete-notice/${noticeId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert(data.error);
                            return;
                        }
                        
                        // Remove the notice from the UI
                        const noticeCard = document.getElementById(`notice-${noticeId}`);
                        if (noticeCard) {
                            noticeCard.remove();
                        }
                        
                        // If there are no more notices, show the empty state
                        if (noticesContainer.children.length === 0) {
                            noticesContainer.innerHTML = `
                                <div class="empty-state">
                                    <p>No notices yet. Be the first to post one!</p>
                                </div>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting notice:', error);
                        alert('Failed to delete notice. Please try again.');
                    });
                }
            });
        }
    }
    
    // Helper function to format date strings
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});