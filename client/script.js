// client/script.js
const menuContainer = document.getElementById('menu-container');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const addItemContainer = document.getElementById('add-item-container');
const itemForm = document.getElementById('item-form');
let authToken = localStorage.getItem('authToken');
// const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://<your-github-username>.github.io/<your-repo-name>';
const apiUrl = window.location.protocol === 'file:' ? 'http://localhost:5000' : 'https://<your-github-username>.github.io/<your-repo-name>';

// Function for button redirect
const redirectToLoginPage = () => {
    console.log("redirectToLoginPage called"); // Debugging log
    window.location.href = 'login.html';
};

const redirectToIndexPage = () => {
    console.log("redirectToIndexPage called");
    window.location.href = 'index.html';
};
//Extract filename from pathname for testing locally
const getFileName = () => {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
};
async function fetchMenuItems() {
    try {
        const response = await fetch(`${apiUrl}/api/menu`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const menuItems = await response.json();
         menuContainer.innerHTML = '';
        menuItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('menu-item');
            itemDiv.innerHTML = `
                <img src="${item.image || 'placeholder.png'}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <p class="price">$${item.price.toFixed(2)}</p>
               ${getFileName() === 'manager.html' ? `<button class="edit-button" data-item-id="${item._id}">Edit</button>
                <button class="delete-button" data-item-id="${item._id}">Delete</button>` : ''}
            `;
             menuContainer.appendChild(itemDiv);
             if (getFileName() === 'manager.html') {
                itemDiv.querySelector('.edit-button').addEventListener('click', () => populateEditForm(item));
                itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteMenuItem(item._id));
            }
        });
    } catch (error) {
        console.error("Failed to fetch menu items: ", error);
        menuContainer.innerHTML = '<p>Failed to load menu.</p>';
    }
}


async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token
            localStorage.setItem('authToken', authToken);
            loginMessage.textContent = 'Logged in successfully!'
            loginMessage.style.color = "green"
            window.location.href = 'manager.html';
        } else {
            loginMessage.textContent = 'Invalid username or password';
        }
    } catch (error) {
        loginMessage.textContent = 'Error during login.';
        console.error('Error:', error);
    }
}

async function handleItemSubmit(event) {
    event.preventDefault();
    const itemId = document.getElementById('item-id').value
    const itemData = {
        name: document.getElementById('item-name').value,
        price: parseFloat(document.getElementById('item-price').value),
        description: document.getElementById('item-description').value,
        category: document.getElementById('item-category').value,
        image: document.getElementById('item-image').value,
    };

    try {
        const method = itemId ? 'PUT' : 'POST';
        const url = itemId ? `${apiUrl}/api/menu/${itemId}` : `${apiUrl}/api/menu`;
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(itemData)
        });

        if (response.ok) {
            itemForm.reset()
            document.getElementById('item-id').value = '';
            addItemContainer.style.display = "none";
            fetchMenuItems(); // Refresh the menu after adding or editing
        } else {
            const errorData = await response.json()
            console.log(errorData)
            alert('Error ' + (itemId ? 'updating' : 'adding') + ' menu item')
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding item')
    }
}


function populateEditForm(item) {
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-description').value = item.description || '';
    document.getElementById('item-category').value = item.category || '';
    document.getElementById('item-image').value = item.image || '';
      document.getElementById('item-id').value = item._id;
    addItemContainer.style.display = "block";
}

async function deleteMenuItem(itemId) {
    if(confirm("Are you sure you want to delete this item?")){
      try {
          const response = await fetch(`${apiUrl}/api/menu/${itemId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${authToken}`,
            },
          })
           if (response.ok) {
                fetchMenuItems();
           } else {
              const errorData = await response.json();
               console.log(errorData);
               alert('Error deleting menu item')
            }

      } catch (error) {
           console.error("Error deleting menu item", error);
           alert("Error deleting menu item")
      }
    }
}

const handleButtonEvents = () => {
    const fileName = getFileName()
  if (fileName === 'login.html' || fileName === 'manager.html') 
    {
        const menuButton = document.getElementById('back-to-menu');
        if (menuButton) {
            menuButton.addEventListener('click', redirectToIndexPage);
             console.log("Login button event listener added"); // Debugging Log
          } else {
            console.error("Error: menuButton not found");
          }
        // if(!menuButton) {
        //    menuButton = document.createElement('button');
        //    menuButton.textContent = 'Back to Menu';
        //    menuButton.id = 'back-to-menu';
        //    menuButton.addEventListener('click', redirectToIndexPage);
        //    document.body.prepend(menuButton);
        // }
    }
    if (fileName === 'login.html') 
    {
      console.log("Login page detected"); // Debugging Log
      loginForm.addEventListener('submit', handleLogin);
    }
    if (fileName === 'manager.html') 
    {
       console.log("Manager page detected"); // Debugging log
        itemForm.addEventListener('submit', handleItemSubmit);
    }
    if (fileName === 'index.html') 
    {
      console.log("Index page detected"); // Debugging log
        const managerLoginButton = document.getElementById('manager-login-button');
        console.log("managerLoginButton:", managerLoginButton) // Debugging log
        if (managerLoginButton) {
          managerLoginButton.addEventListener('click', redirectToLoginPage);
           console.log("Login button event listener added"); // Debugging Log
        } else {
          console.error("Error: managerLoginButton not found");
        }
    }

};
// Attach event listeners
window.addEventListener('DOMContentLoaded', () => {
 handleButtonEvents();
  // Initial load of menu items on all pages
  fetchMenuItems();
});