/**
 * data.js
 * Handles fetching JSON configurations dynamically.
 */

window.GameData = {
    FOODS: [],
    SHOP_ITEMS: [],
    REACTIONS: { likes: [], dislikes: [] },
    loaded: false
};

async function loadGameData() {
    try {
        // En lugar de usar fetch() que falla en entornos file:// por CORS, 
        // usamos las variables globales inyectadas por los scripts .js
        window.GameData.FOODS = window.GameData_FOODS;
        window.GameData.SHOP_ITEMS = window.GameData_SHOP;
        window.GameData.REACTIONS = window.GameData_REACTIONS;
        window.GameData.TROPHIES = window.GameData_TROPHIES || [];
        window.GameData.PUZZLES = window.GameData_PUZZLE || [];
        window.GameData.loaded = true;

        console.log("Game Data Loaded Successfully (Local JS File Mode)", window.GameData);
        return Promise.resolve();
    } catch (err) {
        console.error("Failed to load JS data.", err);
        alert("Error cargando la información de la base de datos local JavaScript.");
    }
}
