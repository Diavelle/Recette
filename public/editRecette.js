document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const editTitle = document.getElementById('editTitle');
    const editIngredientInput = document.getElementById('editIngredientInput');
    const editAddIngredientButton = document.getElementById('editAddIngredientButton');
    const editIngredientList = document.getElementById('editIngredientList');

    const editPreparationInput = document.getElementById('editPreparationInput');
    const editAddPreparationButton = document.getElementById('editAddPreparationButton');
    const editPreparationList = document.getElementById('editPreparationList');

    let ingredients = [];
    let preparations = [];

    // Charger la recette existante
    fetch(`/api/recettes/${id}`)
        .then(response => response.json())
        .then(data => {
            editTitle.value = data.title;
            ingredients = data.ingredients || [];
            preparations = data.preparations || [];

            ingredients.forEach(renderIngredient);
            preparations.forEach(renderPreparation);
        });

    // Ajouter un ingrédient
    const addIngredient = () => {
        const ingredient = editIngredientInput.value.trim();
        if (ingredient) {
            ingredients.push(ingredient);
            renderIngredient(ingredient);
            editIngredientInput.value = '';
        }
    };

    const renderIngredient = (ingredient) => {
        const li = document.createElement('li');
        li.textContent = ingredient;
    
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('removeIngredientButton'); // Ajout de la classe
        removeButton.addEventListener('click', () => {
            ingredients = ingredients.filter(item => item !== ingredient);
            li.remove();
        });
    
        li.appendChild(removeButton);
        editIngredientList.appendChild(li);
    };
    

    editAddIngredientButton.addEventListener('click', addIngredient);

    // Ajouter une étape de préparation
    const addPreparation = () => {
        const preparation = editPreparationInput.value.trim();
        if (preparation) {
            preparations.push(preparation);
            renderPreparation(preparation);
            editPreparationInput.value = '';
        }
    };

    const renderPreparation = (preparation) => {
        const li = document.createElement('li');
        li.textContent = preparation;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('removeIngredientButton'); // Ajout de la classe
        removeButton.addEventListener('click', () => {
            preparations = preparations.filter(item => item !== preparation);
            li.remove();
        });

        li.appendChild(removeButton);
        editPreparationList.appendChild(li);
    };

    editAddPreparationButton.addEventListener('click', addPreparation);

    // Soumettre le formulaire
    document.getElementById('editRecipeForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const updatedRecette = {
            title: editTitle.value,
            ingredients,
            preparations
        };

        fetch(`/api/recettes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRecette)
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = `/recette.html?title=${encodeURIComponent(data.title)}`;
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de la recette:', error);
        });
    });
});
