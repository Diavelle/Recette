document.addEventListener('DOMContentLoaded', () => {
    // Récupérer le paramètre 'title' dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const title = decodeURIComponent(urlParams.get('title'));

    // Charger la recette correspondante depuis l'API
    fetch('/api/recettes')
        .then(response => response.json())
        .then(data => {
            // Trouver la recette correspondant au titre
            const recette = data.find(r => r.title === title);

            if (recette) {
                // Mettre à jour le lien de redirection avec l'ID
                const editButton = document.getElementById('editButton');
                editButton.href = `/editRecette.html?id=${recette.id}`;

                // Afficher le titre de la recette
                document.getElementById('recipeTitle').textContent = recette.title;

                // Afficher l'image de la recette
                const imageElement = document.getElementById('recipeImage');
                if (recette.image) {
                    imageElement.src = recette.image;
                } else {
                    imageElement.style.display = 'none'; // Cacher l'image si elle n'existe pas
                }

                // Afficher les ingrédients
                const ingredientsList = document.getElementById('ingredientsList');
                if (Array.isArray(recette.ingredients)) {
                    recette.ingredients.forEach(ingredient => {
                        const li = document.createElement('li');
                        li.textContent = ingredient;
                        ingredientsList.appendChild(li);
                    });
                } else {
                    recette.ingredients.split(', ').forEach(ingredient => {
                        const li = document.createElement('li');
                        li.textContent = ingredient;
                        ingredientsList.appendChild(li);
                    });
                }

                // Afficher la préparation
                const preparationSteps = document.getElementById('preparationSteps');
                if (Array.isArray(recette.preparations)) {
                    recette.preparations.forEach(step => {
                        const li = document.createElement('li');
                        li.textContent = step;
                        preparationSteps.appendChild(li);
                    });
                } else {
                    recette.preparations.split(', ').forEach(step => {
                        const li = document.createElement('li');
                        li.textContent = step;
                        preparationSteps.appendChild(li);
                    });
                }
            } else {
                document.getElementById('recipeTitle').textContent = 'Recette non trouvée';
            }
        })
        .catch(error => console.error('Erreur de récupération des recettes :', error));
});
