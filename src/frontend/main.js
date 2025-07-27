let currentUser = null;

function showMessage(text, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.innerText = text;
  messageDiv.className = type;
  setTimeout(() => {
    messageDiv.innerText = '';
    messageDiv.className = '';
  }, 5000);
}

function showNotification(text) {
  const notifDiv = document.getElementById('notification');
  notifDiv.innerText = text;
  setTimeout(() => {
    notifDiv.innerText = '';
  }, 5000);
}

function renderNav() {
  if (currentUser) {
    document.getElementById('nav-profile').style.display = 'inline';
    document.getElementById('nav-cars').style.display = 'inline';
    document.getElementById('nav-buy').style.display = 'inline';
    document.getElementById('nav-logout').style.display = 'inline';
    document.getElementById('nav-login').style.display = 'none';
    document.getElementById('nav-register').style.display = 'none';

    document.getElementById('user-info').innerText =
      `Zalogowany jako: ${currentUser.username} | Rola: ${currentUser.role} | Saldo: ${currentUser.balance}`;
  } else {
    document.getElementById('nav-profile').style.display = 'none';
    document.getElementById('nav-cars').style.display = 'none';
    document.getElementById('nav-buy').style.display = 'none';
    document.getElementById('nav-logout').style.display = 'none';
    document.getElementById('nav-login').style.display = 'inline';
    document.getElementById('nav-register').style.display = 'inline';

    document.getElementById('user-info').innerText = 'Nie jesteś zalogowany';
  }
}

async function checkAuth() {
  try {
    const res = await fetch('/users/me');
    if (res.status === 200) {
      currentUser = await res.json();
    } else {
      currentUser = null;
    }
  } catch (err) {
    currentUser = null;
  }
  renderNav();
}

function showView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach((view) => {
    view.style.display = 'none';
  });
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.style.display = 'block';
  }
}

async function loadProfile() {
  if (!currentUser) return;
  document.getElementById('profile-info').innerText =
    `Username: ${currentUser.username}\nSaldo: ${currentUser.balance}`;
}

async function loadCars() {
  try {
    const res = await fetch('/cars');
    if (res.status === 200) {
      const cars = await res.json();
      const carsListDiv = document.getElementById('cars-list');
      carsListDiv.innerHTML = '';

      if (cars.length === 0) {
        carsListDiv.textContent = 'Brak samochodów na sprzedaż.';
      } else {
        cars.forEach((car) => {
          const carItem = document.createElement('div');
          carItem.className = 'car-item';

          carItem.textContent = `ID: ${car.id} | Marka: ${car.brand} | Model: ${car.model} | Cena: ${car.price}`;

          carsListDiv.appendChild(carItem);
        });
      }
    }
  } catch (err) {
    showMessage('Błąd przy pobieraniu samochodów', 'error');
  }
}

function setupEventListeners() {
  window.addEventListener('hashchange', route);
  route();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.status === 200) {
        showMessage('Zalogowano pomyślnie', 'success');
        await checkAuth();
        window.location.hash = '#home';
      } else {
        showMessage(data.error || 'Błąd logowania', 'error');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('regUsername').value;
      const password = document.getElementById('regPassword').value;
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.status === 201) {
        showMessage(
          'Rejestracja powiodła się, możesz się zalogować',
          'success',
        );
        window.location.hash = '#login';
      } else {
        showMessage(data.error || 'Błąd rejestracji', 'error');
      }
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;
      const newUsername = document.getElementById('newUsername').value;
      const newPassword = document.getElementById('newPassword').value;
      const userId = currentUser.id;
      const res = await fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json();
      if (res.status === 200) {
        showMessage('Profil zaktualizowany', 'success');
        await checkAuth();
      } else {
        showMessage(data.error || 'Błąd aktualizacji profilu', 'error');
      }
    });
  }

  const addCarForm = document.getElementById('addCarForm');
  if (addCarForm) {
    addCarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const brand = document.getElementById('carBrand').value;
      const model = document.getElementById('carModel').value;
      const price = parseFloat(document.getElementById('carPrice').value);
      const res = await fetch('/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, price }),
      });
      const data = await res.json();
      if (res.status === 201) {
        showMessage('Samochód dodany', 'success');
        await loadCars();
      } else {
        showMessage(data.error || 'Błąd dodawania samochodu', 'error');
      }
    });
  }

  const buyCarForm = document.getElementById('buyCarForm');
  if (buyCarForm) {
    buyCarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const carId = document.getElementById('buyCarId').value;
      const res = await fetch(`/cars/${carId}/buy`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.status === 200) {
        showMessage('Samochód zakupiony', 'success');
        loadCars();
        await checkAuth();
      } else {
        showMessage(data.error || 'Błąd zakupu samochodu', 'error');
      }
    });
  }
}

function route() {
  const hash = window.location.hash || '#home';
  const viewId = hash.substring(1) + '-view';

  if (hash === '#logout') {
    currentUser = null;
    renderNav();
    showMessage('Wylogowano');
    window.location.hash = '#home';
    return;
  }

  showView(viewId);
  if (viewId === 'profile-view') {
    loadProfile();
  }
  if (viewId === 'cars-view') {
    loadCars();
  }
}

function setupSSE() {
  const evtSource = new EventSource('/sse');
  evtSource.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    showNotification(
      `Powiadomienie: Ktoś właśnie kupił auto! ID: ${msg.carId}`,
    );
  };
}

window.addEventListener('load', async () => {
  await checkAuth();
  setupEventListeners();
  setupSSE();
});
