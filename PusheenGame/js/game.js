/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — game.js
═══════════════════════════════════════════════════════ */

// --- GAME STATE ---
let state = {
    coins: 0,
    happiness: 70,
    hunger: 60,
    love: 70,
    ownedItems: ['pusheen-normal'],
    placedDecorations: [],
    currentOutfit: 'pusheen-normal',
    specialUnlocked: false,
    lastFedTime: 0,
    isDepressed: false,
    pusheenGone: false
};

// Cinematic state
let _cinematicActive = false;
let _barsPaused = false;

// --- INITIALIZATION ---
async function init() {
    await loadGameData(); // Ensure data.js loaded the JSONs
    loadState();
    updateUI();
    renderFoodGrid();
    renderShop('posters');
    renderRoomEdit();

    // Load saved records into the UI
    const rs = localStorage.getItem('record_sushi');
    const rm = localStorage.getItem('record_memory');
    if (rs) { const el = document.getElementById('sushiScore'); if (el) el.innerText = `${rs} pts`; }
    if (rm) { const el = document.getElementById('memoryScore'); if (el) el.innerText = `${rm} pts`; }
    const rb = localStorage.getItem('record_battle');
    if (rb) { const el = document.getElementById('battleScore'); if (el) el.innerText = '¡VICTORIA! 🏆'; }

    // Passive stats decay loop (every 10s) — paused when tab is hidden
    setInterval(() => {
        if (_barsPaused || _cinematicActive) return;
        state.hunger = Math.max(0, state.hunger - 1);
        state.happiness = Math.max(0, state.happiness - 0.5);
        state.love = Math.max(0, state.love - 0.4);

        if (state.hunger === 0 && !state.isDepressed) {
            state.isDepressed = true;
            showBubble("Jueputa que bajón, mi mamá se comió mi fluoxetina, me tienes que comprar más", 4000);
        }

        // Trigger cinematic when BOTH hunger AND love hit 0
        if (state.hunger <= 0 && state.love <= 0 && !state.pusheenGone && !_cinematicActive) {
            triggerCinematic();
        }

        updateUI();
        saveState();
    }, 10000);

    // Pause bars when tab is hidden
    document.addEventListener('visibilitychange', () => {
        _barsPaused = document.hidden;
    });
}

// --- SAVE / LOAD ---
function loadState() {
    const saved = localStorage.getItem('pusheen_state');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    } else {
        // First time
        document.getElementById('screen-splash').classList.add('active');
        document.getElementById('screen-main').classList.remove('active');
    }
}
function saveState() {
    localStorage.setItem('pusheen_state', JSON.stringify(state));
}

// --- NAVIGATION ---
function startGame() {
    document.getElementById('screen-splash').classList.remove('active');
    document.getElementById('screen-main').classList.add('active');
    // Start room music (this click counts as user interaction, enabling browser audio)
    if (window.MusicManager) {
        window.MusicManager.play('rooms');
    }
    // Apply saved volume
    const savedVol = parseFloat(localStorage.getItem('music_volume') || '0.3');
    const audio = document.getElementById('gameAudio');
    if (audio) audio.volume = savedVol;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (screenId === 'screen-main') {
        document.getElementById('screen-main').style.display = 'flex';
    }
}

function switchTab(tabId, btnTarget) {
    // Tabs
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${tabId}`).classList.add('active');
    // Buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btnTarget.classList.add('active');

    if (tabId === 'room') renderRoomEdit();
}

// --- DYNAMIC SPRITE HELPER ---
window.getPusheenImage = function(expression) {
    let outfit = state.currentOutfit || 'pusheen-normal';
    
    // For the default cat, files are pusheen-normal.png, pusheen-happy.png, pusheen-angry.png
    if (outfit === 'pusheen-normal') {
        return `assets/images/pusheen-${expression}.png`;
    } else {
        // For outfits (e.g. pusheen-bruja), files are pusheen-bruja.png, pusheen-bruja-happy.png
        if (expression === 'normal') {
            return `assets/images/${outfit}.png`;
        } else {
            return `assets/images/${outfit}-${expression}.png`;
        }
    }
};

// --- UI UPDATES ---
function updateUI() {
    document.getElementById('coinCount').innerText = state.coins;

    const hapBar  = document.getElementById('happinessBar');
    const hunBar  = document.getElementById('hungerBar');
    const lovBar  = document.getElementById('loveBar');
    const hapText = document.getElementById('happinessText');
    const hunText = document.getElementById('hungerText');
    const lovText = document.getElementById('loveText');

    if (hapBar)  hapBar.style.width  = `${state.happiness}%`;
    if (hunBar)  hunBar.style.width  = `${state.hunger}%`;
    if (lovBar)  lovBar.style.width  = `${state.love}%`;
    if (hapText) hapText.innerText   = `${Math.floor(state.happiness)}%`;
    if (hunText) hunText.innerText   = `${Math.floor(state.hunger)}%`;
    if (lovText) lovText.innerText   = `${Math.floor(state.love)}%`;

    // Hide/show Pusheen sprites
    const sprites = [document.getElementById('pusheenSprite'), document.getElementById('pusheenBathSprite')];
    sprites.forEach(sp => { if (sp) sp.style.visibility = state.pusheenGone ? 'hidden' : 'visible'; });

    if (!state.pusheenGone) {
        const pusheenSprite = document.getElementById('pusheenSprite');
        if (pusheenSprite && !pusheenSprite.className.includes('state-happy') && !pusheenSprite.className.includes('state-angry') && !pusheenSprite.className.includes('state-eating')) {
            if (state.isDepressed) {
                pusheenSprite.src = window.getPusheenImage('angry');
            } else {
                pusheenSprite.src = window.getPusheenImage('normal');
            }
        }
    }

    renderPlacedDecorations();
}

function showBubble(text, duration = 2000) {
    const bubble = document.getElementById('pushBubble');
    bubble.innerText = text;
    bubble.classList.add('visible');
    setTimeout(() => bubble.classList.remove('visible'), duration);
}

function setPusheenState(stateStr, duration = 2000) {
    const sprite = document.getElementById('pusheenSprite');
    sprite.className = `pusheen-sprite state-${stateStr}`;

    if (stateStr === 'happy') sprite.src = window.getPusheenImage('happy');
    if (stateStr === 'angry') sprite.src = window.getPusheenImage('angry');

    setTimeout(() => {
        sprite.className = 'pusheen-sprite';
        updateUI(); // restores outfit image
    }, duration);
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.remove('hidden');
    t.classList.add('visible');
    setTimeout(() => {
        t.classList.remove('visible');
        setTimeout(() => t.classList.add('hidden'), 300);
    }, 2500);
}

// --- FEEDING ---
function renderFoodGrid() {
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = '';
    // Shuffle foods a bit so it's not always same order
    const shuffled = [...window.GameData.FOODS].sort(() => Math.random() - 0.5);

    shuffled.forEach(f => {
        const cost = f.price || (f.type === 'like' ? 5 : 2);
        const el = document.createElement('div');
        el.className = `food-item ${f.type === 'like' ? 'liked' : 'disliked'}`;
        el.innerHTML = `
      <div class="food-price-badge"><img src="assets/images/roccoin.png" style="width:14px; vertical-align:middle; margin-right:2px; border-radius:50%; object-fit:cover;" alt="RC"> ${cost}</div>
      <div class="food-emoji"><img src="assets/images/${f.image}" style="width:100%; height:100%; object-fit:contain;" alt="${f.name}"/></div>
      <div class="food-name">${f.name}</div>
    `;
        el.onclick = () => feedPusheen(f, el, cost);
        grid.appendChild(el);
    });
}

function feedPusheen(food, element, cost) {
    if (state.coins < cost) {
        showToast(`Te faltan Roccoins para comprar ${food.name} 🐾`);
        switchTab('games', document.querySelector('[data-panel="games"]'));
        return;
    }

    const now = Date.now();
    if (now - state.lastFedTime < 2500) return; // cooldown

    if (state.isDepressed && food.type !== 'cure') {
        showBubble("Jueputa que bajón, mi mamá se comió mi fluoxetina, me tienes que comprar más", 3500);
        return;
    }

    state.lastFedTime = now;
    state.coins -= cost;
    updateUI();

    // Animation element
    const animLayer = document.getElementById('foodAnimLayer');
    const rect = element.getBoundingClientRect();
    const roomRect = animLayer.getBoundingClientRect();

    const floater = document.createElement('div');
    floater.className = 'food-float';
    floater.innerHTML = `<img src="assets/images/${food.image}" style="width:30px; height:30px; border-radius:50%; box-shadow:0 5px 15px rgba(0,0,0,0.3)"/>`;
    floater.style.left = `${rect.left - roomRect.left + 15}px`;
    floater.style.top = `${rect.top - roomRect.top}px`;
    animLayer.appendChild(floater);

    // Set eating state slightly before the float finishes
    setTimeout(() => setPusheenState('eating', 800), 400);

    setTimeout(() => {
        floater.remove();
        if (food.type === 'cure') {
            state.isDepressed = false;
            state.hunger = 100;
            state.happiness = 100;
            setPusheenState('happy', 2000);
            showBubble("¡Ya me siento mucho mejor! ✨🍄", 2500);
            const sfx = document.getElementById('sfxHappy');
            if (sfx) { sfx.currentTime = 0; sfx.play().catch(e => { }); }
        } else if (food.type === 'like') {
            state.happiness = Math.min(100, state.happiness + 20);
            state.hunger = Math.min(100, state.hunger + 30);
            setPusheenState('happy', 2000);
            const msg = window.GameData.REACTIONS.likes[Math.floor(Math.random() * window.GameData.REACTIONS.likes.length)];
            showBubble(msg);
            const sfx = document.getElementById('sfxHappy');
            if (sfx) { sfx.currentTime = 0; sfx.play().catch(e => { }); }
        } else {
            state.happiness = Math.max(0, state.happiness - 15);
            state.hunger = Math.min(100, state.hunger + 10);
            setPusheenState('angry', 2000);
            const msg = window.GameData.REACTIONS.dislikes[Math.floor(Math.random() * window.GameData.REACTIONS.dislikes.length)];
            showBubble(msg);
            const sfx = document.getElementById('sfxAngry');
            if (sfx) { sfx.currentTime = 0; sfx.play().catch(e => { }); }
        }
        updateUI();
        saveState();
    }, 800);
}

// --- SHOP ---
function setShopCat(catId, btnTarget) {
    document.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active'));
    btnTarget.classList.add('active');
    renderShop(catId);
}

function renderShop(category) {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    const items = window.GameData.SHOP_ITEMS.filter(i => i.cat === category);
    items.forEach(item => {
        const isOwned = state.ownedItems.includes(item.id);
        const lockedSpecial = item.isSpecial && !isOwned;
        const isOutfit = item.cat === 'outfits';

        const el = document.createElement('div');
        el.className = `shop-item ${isOwned ? 'owned' : ''} ${lockedSpecial ? 'locked-special' : ''} ${isOutfit ? 'is-outfit' : ''}`;

        if (lockedSpecial) {
            el.innerHTML = `
        <div class="si-icon">🔒</div>
        <div class="si-name">???</div>
        <div class="si-special">Completa el Reto</div>
      `;
            el.onclick = () => showToast("Desbloquéalo en el minijuego Memory Match 👀");
        } else {
            el.innerHTML = `
        <div class="si-icon"><img src="assets/images/${item.image}" alt="${item.name}" class="shop-img-auto" style="${isOutfit ? '' : 'max-height: 120px;'} margin-bottom:5px; border-radius: 4px;"/></div>
        <div class="si-name">${item.name}</div>
        ${isOwned ? '<div class="si-owned">Comprado ✓</div>' : `<div class="si-price"><img src="assets/images/roccoin.png" style="width:14px; vertical-align:middle; margin-right:2px; border-radius:50%; object-fit:cover;" alt="RC"> ${item.price} Roccoins</div>`}
      `;
            el.onclick = () => isOwned ? handleEquip(item) : attemptBuyTrigger(item);
        }
        grid.appendChild(el);
    });
}

function attemptBuyTrigger(item) {
    // Show confirmation modal
    const modal = document.getElementById('modal-buy');
    document.getElementById('buyImg').src = `assets/images/${item.image}`;
    document.getElementById('buyTitle').innerText = item.name;
    document.getElementById('buyDesc').innerText = item.desc || "";
    document.getElementById('buyPriceBtn').innerText = `Comprar (🪙 ${item.price})`;
    modal.classList.remove('hidden');

    window.currentBuyItem = item;
}

window.executeBuy = function () {
    const item = window.currentBuyItem;
    if (!item) return;

    if (state.coins >= item.price) {
        state.coins -= item.price;
        state.ownedItems.push(item.id);
        const sfx = document.getElementById('sfxCoin');
        if (sfx) { sfx.currentTime = 0; sfx.play().catch(e => { }); }

        showToast(`¡Compraste ${item.name}! 🎉`);
        saveState();

        const activeCatBtn = document.querySelector('.shop-tab.active');
        if (activeCatBtn) renderShop(activeCatBtn.dataset.cat);
        updateUI();
        document.getElementById('modal-buy').classList.add('hidden');
    } else {
        showToast(`No tienes suficientes Roccoins 🐾. Te faltan ${item.price - state.coins}`);
    }
}

function handleEquip(item) {
    if (item.cat === 'outfits') {
        state.currentOutfit = item.id;
        showToast('¡Outfit cambiado! 🎀');
        saveState();
        updateUI();
    } else if (item.type === 'furniture') {
        showToast('¡Ve al ícono superior de Estantería para verla! 🚪');
    } else if (item.type === 'shelf_item') {
        showToast('¡Este objeto ya está en tu colección de Estantería! 🏆');
    } else {
        // Escudo para posters/deco
        switchTab('room', document.querySelector('[data-panel="room"]'));
        showToast('Toca para colocarlo/quitarlo de la habitación 🏠');
    }
}

// --- DECORATION (ROOM EDIT) ---
function renderRoomEdit() {
    const grid = document.getElementById('roomEditGrid');
    grid.innerHTML = '';

    const decorItems = window.GameData.SHOP_ITEMS.filter(i => 
        (i.cat === 'posters' || i.cat === 'decor') && 
        state.ownedItems.includes(i.id) &&
        i.type !== 'furniture' && i.type !== 'shelf_item'
    );

    if (decorItems.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#7a6ea0; font-size:.8rem;">No tienes decoraciones. ¡Ve a la tienda! 🛍️</p>';
        return;
    }

    decorItems.forEach(item => {
        const isPlaced = state.placedDecorations.includes(item.id);
        const el = document.createElement('div');
        el.className = `shop-item ${isPlaced ? 'owned' : ''}`;
        el.innerHTML = `
      <div class="si-icon"><img src="assets/images/${item.image}" alt="${item.name}" style="max-height: 120px; margin-bottom:5px; border-radius: 4px;"/></div>
      <div class="si-name">${item.name}</div>
      <div class="si-owned">${isPlaced ? 'Colocado ✓' : 'Guardado'}</div>
    `;
        el.onclick = () => toggleDecoration(item);
        grid.appendChild(el);
    });
}

function toggleDecoration(item) {
    const idx = state.placedDecorations.indexOf(item.id);

    // Check shelf logic
    if (item.type === 'shelf_item' && idx === -1) {
        // trying to place shelf_item but shelf is not placed
        const hasShelf = state.placedDecorations.some(id => window.GameData.SHOP_ITEMS.find(i => i.id === id)?.type === 'furniture');
        if (!hasShelf) {
            showToast("Primero debes poner la Estantería para poner esto encima 🌸");
            return;
        }
    }

    if (item.type === 'wall' && idx === -1) {
        // trying to place wall item, enforce max 3
        const activePosters = state.placedDecorations.filter(id => window.GameData.SHOP_ITEMS.find(i => i.id === id)?.type === 'wall');
        if (activePosters.length >= 3) {
            showToast("La pared está llena 🏠 Solo caben 3 cuadros (quita de la habitación alguno para poner este)");
            return;
        }
    }

    if (idx > -1) {
        // remove
        state.placedDecorations.splice(idx, 1);
        // if removing shelf, also remote shelf items
        if (item.type === 'furniture') {
            state.placedDecorations = state.placedDecorations.filter(id => {
                const subitem = window.GameData.SHOP_ITEMS.find(i => i.id === id);
                return subitem?.type !== 'shelf_item';
            });
            showToast("Quitaste la estantería (y lo que tenía encima) 🏠");
        }
    } else {
        // add
        state.placedDecorations.push(item.id);
    }

    saveState();
    renderRoomEdit();
    renderPlacedDecorations();
}

function renderPlacedDecorations() {
    const layer = document.getElementById('decorationsLayer');
    layer.innerHTML = '';

    let wallCount = 0;
    // FIXED SLOTS PARA POSTERS: [top, left] -> izq, centro, der
    let wallOffsets = [[20, 15], [20, 50], [20, 85]];

    let shelfPlaced = false;

    state.placedDecorations.forEach(id => {
        const item = window.GameData.SHOP_ITEMS.find(i => i.id === id);
        if (!item) return;
        // Only render wall posters in the room — furniture and shelf_items go to the Shelf Room
        if (item.type !== 'wall') return;

        const el = document.createElement('div');
        el.className = 'placed-deco';

        const pos = wallOffsets[wallCount % 3];
        el.className += ' deco-poster shadow-poster';
        el.style.left = `${pos[1]}%`;
        el.style.top = `${pos[0]}%`;
        el.style.transform = 'translate(-50%, -50%)';
        wallCount++;

        el.innerHTML = `<img src="assets/images/${item.image}" alt="${item.name}" />`;
        layer.appendChild(el);
    });
}

// Global exposure
window.addCoins = function (amount) {
    state.coins += amount;
    // Minigames award love (if amount > 3 it's a minigame reward, not a bath drip)
    if (amount > 3) {
        state.love = Math.min(100, state.love + Math.min(8, amount * 0.1));
    }
    updateUI();
    saveState();
    showToast(`¡Ganaste ${amount} Roccoins!`);
};

window.unlockSpecial = function () {
    if (!state.ownedItems.includes('d_vwbox')) {
        state.ownedItems.push('d_vwbox');
        state.specialUnlocked = true;
        saveState();

        // Show Modal
        document.getElementById('modal-unlock').classList.remove('hidden');
    }
}

window.revealUnlock = function () {
    document.getElementById('unlockBtn').classList.add('hidden');
    document.getElementById('unlockItems').classList.remove('hidden');
    document.getElementById('unlockDone').classList.remove('hidden');
    document.querySelector('.unlock-text').innerText = "Anillo y encendedor de Vivienne Westwood 🖤";
}

window.closeUnlock = function () {
    document.getElementById('modal-unlock').classList.add('hidden');
    showToast("¡Caja de VW desbloqueada en tu estantería! 🎁");
}

window.unlockTrophy = function(gameId, didWin) {
    if (!window.GameData || !window.GameData.TROPHIES) return;
    const trophy = window.GameData.TROPHIES.find(t => t.gameId === gameId);
    if (!trophy) return;
    if (trophy.requiresWin && !didWin) return;

    if (!state.ownedTrophies) state.ownedTrophies = [];

    if (!state.ownedTrophies.includes(trophy.id)) {
        state.ownedTrophies.push(trophy.id);
        saveState();
        showToast(`🏆 ¡Nuevo premio desbloqueado: ${trophy.name}! Revisa tu Estantería.`);
    }
};

window.openShelfRoom = function() {
    if (!state.ownedItems.includes('d_shelf')) {
        showToast('¡Necesitas comprar la Estantería en la tienda primero! 🛒');
        return;
    }
    showScreen('screen-shelf');
    renderShelfRoom();
}

function renderShelfRoom() {
    const grid = document.getElementById('shelfRoomGrid');
    grid.innerHTML = '';

    // 1. Get explicitly placed shelf_items from the shop
    const shelfItems = window.GameData.SHOP_ITEMS.filter(i => i.type === 'shelf_item' && state.ownedItems.includes(i.id));

    // 2. Get unlocked trophies
    if (!state.ownedTrophies) state.ownedTrophies = [];
    const earnedTrophies = window.GameData.TROPHIES.filter(t => state.ownedTrophies.includes(t.id));

    // Combine them to place on the shelf
    const allItemsToDisplay = [...shelfItems, ...earnedTrophies];
    
    // We create fixed slots to make it look like a physical shelf.
    // Let's create 9 slots exactly (3x3 grid)
    for (let i = 0; i < 9; i++) {
        const slotEl = document.createElement('div');
        slotEl.className = 'shelf-slot';
        
        if (allItemsToDisplay[i]) {
            const item = allItemsToDisplay[i];
            slotEl.innerHTML = `<img src="assets/images/${item.image}" alt="${item.name}" class="shelf-item-img" />`;
            // Click opens a proper detail modal
            slotEl.onclick = () => showShelfItemDetail(item);
            // Add a small bounce animation to trophies
            if (item.gameId) {
                slotEl.querySelector('img').style.animation = 'bounce 2s infinite ease-in-out';
            }
        }
        
        grid.appendChild(slotEl);
    }
}

function showShelfItemDetail(item) {
    // Reuse elements from the buy modal, but repurpose them as a read-only detail view
    document.getElementById('buyImg').src          = `assets/images/${item.image}`;
    document.getElementById('buyTitle').innerText  = item.name || '';
    document.getElementById('buyDesc').innerText   = item.desc || 'Sin descripción.';
    document.getElementById('buyPriceBtn').style.display = 'none';
    // Add a close-only button text
    const cancelBtn = document.querySelector('#modal-buy .btn-secondary');
    if (cancelBtn) cancelBtn.innerText = 'Cerrar';
    document.getElementById('modal-buy').classList.remove('hidden');
}

function attemptBuyTrigger(item) {
    const buyBtn = document.getElementById('buyPriceBtn');
    if (buyBtn) buyBtn.style.display = '';
    const cancelBtn = document.querySelector('#modal-buy .btn-secondary');
    if (cancelBtn) cancelBtn.innerText = 'Soy pobre 🥺';
    document.getElementById('buyImg').src         = `assets/images/${item.image}`;
    document.getElementById('buyTitle').innerText = item.name;
    document.getElementById('buyDesc').innerText  = item.desc || '';
    document.getElementById('buyPriceBtn').innerHTML =
        `<img src="assets/images/roccoin.png" style="width:28px; height:28px; vertical-align:middle; margin-right:6px; border-radius:50%; object-fit:cover;" alt="RC"> Comprar · ${item.price} Roccoins`;
    document.getElementById('modal-buy').classList.remove('hidden');
    window.currentBuyItem = item;
}
window.showCheatModal = function () {
    document.getElementById('modal-cheat').classList.remove('hidden');
    document.getElementById('cheatInput').value = '';
}

window.applyCheatCode = function () {
    const code = document.getElementById('cheatInput').value.trim();
    if (code === 'Stripchat') {
        window.addCoins(100);
        showToast('🔑 Código Secreto: +100 Roccoins');
    } else if (code === 'Saris') {
        window.addCoins(1000);
        showToast('🔑 ¡Modo Dios! +1000 Roccoins');
    } else if (code.toLowerCase() === 'teamoryo') {
        if (!state.ownedItems.includes('pusheen-rocco')) {
            state.ownedItems.push('pusheen-rocco');
            state.currentOutfit = 'pusheen-rocco';
            saveState(); updateUI();
            showToast('💖 ¡Outfit ROCCO desbloqueado y equipado! 💖');
        } else {
            showToast('💖 ¡Ya tienes este outfit desbloqueado! 💖');
        }
    } else if (code.toLowerCase() === 'cinematica') {
        document.getElementById('modal-cheat').classList.add('hidden');
        triggerCinematic();
        return;
    } else {
        showToast('Código incorrecto 🤷‍♀️');
    }
    document.getElementById('modal-cheat').classList.add('hidden');
}

// ─── CINEMATIC SYSTEM ───

// Show the "Pusheen left" banner
function triggerCinematic() {
    if (_cinematicActive) return;
    _cinematicActive = true;
    state.pusheenGone = true;
    saveState();
    updateUI();
    const banner = document.getElementById('cinematicBanner');
    if (banner) banner.classList.remove('hidden');
    if (window.MusicManager) window.MusicManager.play('cinematica');
}

// Play the 10-image slideshow
function playCinematic() {
    const banner = document.getElementById('cinematicBanner');
    if (banner) banner.classList.add('hidden');

    const overlay = document.getElementById('cinematicOverlay');
    const img = document.getElementById('cinematicImg');
    if (!overlay || !img) { endCinematic(); return; }

    overlay.style.display = 'flex';
    img.style.opacity = '0';

    const TOTAL_FRAMES = 10;
    let frame = 1;

    function showFrame() {
        if (frame > TOTAL_FRAMES) { endCinematic(); return; }

        // Instantly hide while loading the new image
        img.style.transition = 'none';
        img.style.opacity    = '0';
        img.src = `assets/images/cinematica_${frame}.png`;

        function runFrame() {
            // Re-enable transition and fade IN
            img.style.transition = 'opacity 0.8s';
            img.style.opacity    = '1';

            // After 3s visible, fade OUT
            setTimeout(() => {
                img.style.opacity = '0';
                // After fade-out completes, load next frame
                setTimeout(() => {
                    frame++;
                    showFrame();
                }, 850); // slightly longer than transition (0.8s)
            }, 3000);
        }

        // Wait for the image to actually load before fading in
        if (img.complete && img.naturalWidth > 0) {
            // Already cached
            setTimeout(runFrame, 50);
        } else {
            img.onload  = () => { img.onload = null; setTimeout(runFrame, 50); };
            img.onerror = () => { img.onerror = null; frame++; showFrame(); }; // skip missing frames
        }
    }
    showFrame();
}

window.setMusicVolume = function (val) {
    const v = parseFloat(val);
    const audio = document.getElementById('gameAudio');
    if (audio) audio.volume = v;
    localStorage.setItem('music_volume', v);
};

function endCinematic() {
    const overlay = document.getElementById('cinematicOverlay');
    if (overlay) overlay.style.display = 'none';
    _cinematicActive = false;
    state.pusheenGone = false;
    state.hunger = 100;
    state.isDepressed = false;
    saveState();
    updateUI();
    showBubble('¡Gracias por traerme de vuelta! 💜', 3000);
    if (window.MusicManager) window.MusicManager.play('rooms');
}

// Global so onclick in HTML can call it
window.playCinematic = playCinematic;

window.showSettingsModal = function () {
    // Sync slider to current saved volume
    const savedVol = parseFloat(localStorage.getItem('music_volume') || '0.3');
    const slider = document.getElementById('volumeSlider');
    if (slider) slider.value = savedVol;
    document.getElementById('modal-settings').classList.remove('hidden');
}

window.resetGameData = function () {
    if (confirm('¿Seguro que quieres borrar todo el progreso? Esto no se puede deshacer.')) {
        localStorage.removeItem('pusheen_state');
        location.reload();
    }
}

// --- ROOM SLIDER (Bedroom ↔ Bathroom) ---
let _currentRoom = 'main';

function slideRoom(target) {
    const bathroom = document.getElementById('bathroomRoom');
    if (!bathroom) return;
    if (target === 'bathroom') {
        bathroom.classList.add('bathroom-visible');
        _currentRoom = 'bathroom';
        initBathroom();
    } else {
        bathroom.classList.remove('bathroom-visible');
        _currentRoom = 'main';
    }
}

// --- BATHROOM / SPONGE MECHANIC ---
let _bathCooldown = false;
let _bathActive = false;
let _bathCleanups = [];

function initBathroom() {
    const spongeEl = document.getElementById('dragSponge');
    const pusheenEl = document.getElementById('pusheenBathSprite');
    const particlesEl = document.getElementById('bathParticles');
    if (!spongeEl || pusheenEl === null) return;
    
    // Clean up previous listeners
    _bathCleanups.forEach(fn => fn());
    _bathCleanups = [];
    
    // Reset sponge position
    spongeEl.style.left = '';
    spongeEl.style.top = '';
    spongeEl.style.transform = '';

    let dragging = false;
    let spongeRect = spongeEl.getBoundingClientRect();
    let startX, startY, elStartLeft, elStartTop;

    function getSpongeCenter() {
        spongeRect = spongeEl.getBoundingClientRect();
        return { x: spongeRect.left + spongeRect.width / 2, y: spongeRect.top + spongeRect.height / 2 };
    }

    function getpusheenRect() {
        return pusheenEl.getBoundingClientRect();
    }

    function spawnHeart(x, y) {
        const heart = document.createElement('span');
        heart.className = 'bath-heart';
        heart.textContent = ['💜', '💗', '💖', '❤️', '💕'][Math.floor(Math.random() * 5)];
        const container = document.getElementById('bathroomRoom');
        const containerRect = container.getBoundingClientRect();
        heart.style.left = (x - containerRect.left - 12) + 'px';
        heart.style.top  = (y - containerRect.top  - 12) + 'px';
        particlesEl.appendChild(heart);
        setTimeout(() => heart.remove(), 1300);
    }

    function onBath() {
        if (_bathCooldown) return;
        _bathCooldown = true;

        // Give reward
        state.hygiene = Math.min(100, (state.hygiene || 0) + 8);
        state.happiness = Math.min(100, state.happiness + 5);
        state.love = Math.min(100, state.love + 5); // bathing raises love!
        window.addCoins(2);
        saveState();
        updateUI();

        // Happy sprite
        pusheenEl.src = window.getPusheenImage('happy');
        setTimeout(() => {
            pusheenEl.src = window.getPusheenImage('normal');
        }, 1500);

        // Spawn hearts near Pusheen
        const pr = getpusheenRect();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                spawnHeart(
                    pr.left + Math.random() * pr.width,
                    pr.top + Math.random() * pr.height * 0.5
                );
            }, i * 150);
        }

        setTimeout(() => { _bathCooldown = false; }, 600);
    }

    function checkOverlap() {
        const sc = getSpongeCenter();
        const pr = getpusheenRect();
        if (sc.x > pr.left && sc.x < pr.right && sc.y > pr.top && sc.y < pr.bottom) {
            onBath();
        }
    }

    // Pointer events for drag
    function onPointerDown(e) {
        dragging = true;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        const rect = spongeEl.getBoundingClientRect();
        const parentRect = spongeEl.parentElement.getBoundingClientRect();
        elStartLeft = rect.left - parentRect.left;
        elStartTop  = rect.top  - parentRect.top;
        spongeEl.style.position = 'absolute';
        spongeEl.style.right = 'unset';
        spongeEl.style.bottom = 'unset';
        spongeEl.style.left = elStartLeft + 'px';
        spongeEl.style.top  = elStartTop  + 'px';
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!dragging) return;
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        spongeEl.style.left = (elStartLeft + dx) + 'px';
        spongeEl.style.top  = (elStartTop  + dy) + 'px';
        checkOverlap();
        e.preventDefault();
    }

    function onPointerUp() { dragging = false; }

    spongeEl.addEventListener('touchstart',  onPointerDown, { passive: false });
    spongeEl.addEventListener('touchmove',   onPointerMove, { passive: false });
    spongeEl.addEventListener('touchend',    onPointerUp);
    spongeEl.addEventListener('mousedown',   onPointerDown);
    document.addEventListener('mousemove',   onPointerMove);
    document.addEventListener('mouseup',     onPointerUp);

    _bathCleanups = [
        () => spongeEl.removeEventListener('touchstart',  onPointerDown),
        () => spongeEl.removeEventListener('touchmove',   onPointerMove),
        () => spongeEl.removeEventListener('touchend',    onPointerUp),
        () => spongeEl.removeEventListener('mousedown',   onPointerDown),
        () => document.removeEventListener('mousemove',   onPointerMove),
        () => document.removeEventListener('mouseup',     onPointerUp),
    ];
}

// Start app
window.onload = init;
