document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.getElementById('status-display');
    const usersList = document.getElementById('users-list');

    // The backend uses port 3000 by default in server.js
    const API_URL = 'http://localhost:3000/api';

    // Fetch Database Connection Status
    fetch(`${API_URL}/status`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Database is connected!') {
                statusDisplay.innerHTML = `<span class="success">Connected!</span> (Time: ${new Date(data.time).toLocaleString()})`;
            } else {
                statusDisplay.innerHTML = `<span class="error">Not Connected.</span> ${data.error || ''}`;
            }
        })
        .catch(err => {
            statusDisplay.innerHTML = `<span class="error">Server is offline.</span> Make sure your backend node server is running.`;
            console.error('Status fetch error:', err);
        });

    // Fetch Users
    fetch(`${API_URL}/users`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch from server');
            return response.json();
        })
        .then(data => {
            usersList.innerHTML = '';
            if (data.length === 0) {
                usersList.innerHTML = '<li class="loading">No users found in database.</li>';
                return;
            }
            data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.id}: ${user.name} (${user.email})`;
                usersList.appendChild(li);
            });
        })
        .catch(err => {
            usersList.innerHTML = `<li><span class="error">Unable to fetch data.</span> Is PostgreSQL running and properly seeded?</li>`;
            console.error('Users fetch error:', err);
        });
});
