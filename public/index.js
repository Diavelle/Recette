document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const recettesContainer = document.getElementById('recettesContainer');
    const searchInput = document.getElementById('searchInput');
    const addRecipeButton = document.getElementById('addRecipeButton');
    const addRecipeForm = document.getElementById('addRecipeForm');
    const recipeForm = document.getElementById('recipeForm');
    const cancelButton = document.getElementById('cancelButton');

    const addIngredientButton = document.getElementById('addIngredientButton');
    const addPreparationButton = document.getElementById('addPreparationButton');
    const ingredientInput = document.getElementById('ingredientInput');
    const ingredientList = document.getElementById('ingredientList');
    const preparationInput = document.getElementById('preparationInput');
    const preparationList = document.getElementById('preparationList');

    // Tableaux pour les ingrédients et préparations
    let ingredients = [];
    let preparations = [];

    // Fonction pour ajouter un ingrédient à la liste
    const addIngredient = () => {
        const ingredient = ingredientInput.value.trim();
        if (ingredient) {
            ingredients.push(ingredient);
            renderIngredient(ingredient);
            ingredientInput.value = ''; // Réinitialiser le champ
            ingredientInput.focus();    // Garder le focus sur l'input
        }
    };

    // Ajouter un événement pour détecter la touche "Entrée" dans le champ d'ingrédients
    ingredientInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche la soumission du formulaire ou autres actions par défaut
            addIngredient(); // Ajoute l'ingrédient comme si on cliquait sur le bouton
        }
    });

    addIngredientButton.addEventListener('click', addIngredient);

    // Fonction pour afficher un ingrédient dans la liste
    const renderIngredient = (ingredient) => {
        const li = document.createElement('li');
        li.textContent = ingredient;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('removeButton');
        removeButton.addEventListener('click', () => removeIngredient(ingredient, li));

        li.appendChild(removeButton);
        ingredientList.appendChild(li);
    };

    // Fonction pour supprimer un ingrédient de la liste
    const removeIngredient = (ingredient, li) => {
        ingredients = ingredients.filter(item => item !== ingredient);
        li.remove();
    };

    // Fonction pour ajouter une étape de préparation à la liste
    const addPreparation = () => {
        const preparation = preparationInput.value.trim();
        if (preparation) {
            preparations.push(preparation);
            renderPreparation(preparation);
            preparationInput.value = '';  // Réinitialiser le champ
            preparationInput.focus();    // Garder le focus sur l'input
        }
    };

        // Ajouter un événement pour détecter la touche "Entrée" dans le champ étapes de préparations
        preparationInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Empêche la soumission du formulaire ou autres actions par défaut
                addPreparation(); // Ajoute l'ingrédient comme si on cliquait sur le bouton
            }
        });

    addPreparationButton.addEventListener('click', addPreparation);

    // Fonction pour afficher une étape de préparation dans la liste
    const renderPreparation = (preparation) => {
        const li = document.createElement('li');
        li.textContent = preparation;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add('removeButton');
        removeButton.addEventListener('click', () => removePreparation(preparation, li));

        li.appendChild(removeButton);
        preparationList.appendChild(li);
    };

    // Fonction pour supprimer une étape de préparation de la liste
    const removePreparation = (preparation, li) => {
        preparations = preparations.filter(item => item !== preparation);
        li.remove();
    };

    // Fonction pour charger et afficher les recettes depuis l'API
    const loadRecettes = () => {
        fetch('/api/recettes')
            .then(response => response.json())
            .then(data => {
                recettesContainer.innerHTML = ''; // Réinitialiser le conteneur
                data.forEach(recette => {
                    const recetteDiv = renderRecette(recette);
                    recettesContainer.appendChild(recetteDiv);
                });

                // Filtrer les recettes qui correspondent à la recherche
                filterRecettes(); // Filtrer les recettes après leur ajout au DOM
            });
    };

    // Fonction pour afficher une recette
    const renderRecette = (recette) => {
        const recetteDiv = document.createElement('div');
        recetteDiv.classList.add('recette');

        // Ajouter l'image si elle existe
        if (recette.image) {
            const imageElement = document.createElement('img');
            imageElement.src = recette.image;
            imageElement.alt = `Image de ${recette.title}`;
            imageElement.classList.add('imgRecette');
            recetteDiv.appendChild(imageElement);
        }

        // Ajouter le titre de la recette
        const titleElement = document.createElement('h3');
        titleElement.textContent = recette.title;
        titleElement.classList.add('titreRecette');
        recetteDiv.appendChild(titleElement);

        // Ajouter un bouton de suppression pour la recette
        const removeRecipeButton = document.createElement('button');
        removeRecipeButton.textContent = 'X';
        removeRecipeButton.classList.add('removeRecipeButton');
        removeRecipeButton.addEventListener('click', () => deleteRecette(recette.id, recetteDiv));

        // Événement pour la suppression de la recette
        removeRecipeButton.addEventListener('click', (event) => {
            event.stopPropagation();  // Empêche la propagation de l'événement, donc pas de redirection
            deleteRecette(recette.id, recetteDiv);
        });

        recetteDiv.appendChild(removeRecipeButton);

        // Cliquer sur une recette pour voir les détails
        recetteDiv.addEventListener('click', () => {
            window.location.href = `/recette.html?title=${encodeURIComponent(recette.title)}`;
        });

        return recetteDiv;
    };

    // Fonction pour supprimer une recette
    const deleteRecette = (id, recetteDiv) => {
        fetch(`/api/recettes/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    recetteDiv.remove();  // Supprimer la recette du DOM si la suppression a réussi
                    console.log('Recette supprimée avec succès');
                } else {
                    console.error('Échec de la suppression de la recette');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la suppression:', error);
            });
    };

    // Filtrer les recettes en fonction de la recherche
    const filterRecettes = () => {
        const searchQuery = searchInput.value.trim().toLowerCase();
        const recetteElements = document.querySelectorAll('.recette');
        recetteElements.forEach(element => {
            const title = element.querySelector('.titreRecette').textContent.toLowerCase();
            if (title.includes(searchQuery)) {
                element.style.display = 'flex';  // Afficher la recette
            } else {
                element.style.display = 'none';  // Masquer la recette
            }
        });
    };

    // Afficher le formulaire pour ajouter une recette
    addRecipeButton.addEventListener('click', () => {
        addRecipeForm.style.display = 'block';
    });

    // Annuler l'ajout de la recette
    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();  // Empêche la redirection
        addRecipeForm.style.display = 'none';
        recipeForm.reset();
        ingredients = [];
        preparations = [];
        ingredientList.innerHTML = '';
        preparationList.innerHTML = '';
    });

    // Soumettre le formulaire pour ajouter une recette
    recipeForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Récupérer les valeurs du formulaire
        const title = recipeForm.querySelector('[name="title"]').value;
        const ingredients = []; // Assurez-vous d'avoir un moyen de récupérer vos ingrédients sous forme de tableau
        const preparations = []; // Assurez-vous d'avoir un moyen de récupérer vos préparations sous forme de tableau
    
        // Créer l'objet de données à envoyer
        const data = {
            title,
            ingredients: JSON.stringify(ingredients), // Utiliser JSON.stringify pour envoyer un tableau
            preparations: JSON.stringify(preparations), // Utiliser JSON.stringify pour envoyer un tableau
        };
    
        fetch('/api/recettes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indiquer que le corps de la requête est en JSON
            },
            body: JSON.stringify(data), // Convertir les données en chaîne JSON
        })
        .then(response => response.json())
        .then(data => {
            console.log('Recette ajoutée avec succès:', data);
            addRecipeForm.style.display = 'none';
            loadRecettes(); // Recharger les recettes
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la recette:', error);
        });
    });


    // Écouteur d'événement pour la recherche
    searchInput.addEventListener('input', () => {
        filterRecettes(); // Filtrer les recettes à chaque saisie dans la barre de recherche
    });

    // Charger les recettes au chargement de la page
    loadRecettes();
});
