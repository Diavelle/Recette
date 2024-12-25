const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configuration de multer pour gérer les fichiers d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // Créer le dossier 'uploads' si il n'existe pas
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${path.extname(file.originalname)}`; // Générer un nom de fichier unique
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Type de fichier non autorisé. Veuillez télécharger une image.'));
        }
        cb(null, true);
    }
});

const app = express();
const port = 3000;
const recettesFilePath = path.join(__dirname, 'recettes.json'); // Chemin vers le fichier JSON des recettes

// Middleware pour servir les fichiers statiques et analyser les requêtes JSON et URL encodées
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fonction utilitaire pour lire les recettes à partir du fichier JSON
const readRecettes = () => {
    try {
        return JSON.parse(fs.readFileSync(recettesFilePath, 'utf8'));
    } catch (err) {
        return []; // Retourner un tableau vide si le fichier n'existe pas
    }
};

// Fonction utilitaire pour écrire les recettes dans le fichier JSON
const writeRecettes = (recettes) => {
    const recettesJson = JSON.stringify(recettes, null, 2);
    console.log('Recettes mises à jour :', recettesJson); // Ajouter ce log pour vérifier
    fs.writeFileSync(recettesFilePath, recettesJson);
};


// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API pour récupérer toutes les recettes
app.get('/api/recettes', (req, res) => {
    const recettes = readRecettes();
    res.json(recettes);
});

// Route pour servir les détails d'une recette (exemple : recette.html)
app.get('/recette', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recette.html'));
});

// API pour récupérer une recette par son ID
app.get('/api/recettes/:id', (req, res) => {
    const recetteId = req.params.id;

    // Charger les recettes depuis le fichier JSON
    const recettes = readRecettes();

    // Trouver la recette par ID
    const recette = recettes.find(r => r.id === recetteId);

    if (!recette) {
        return res.status(404).send({ error: 'Recette non trouvée' });
    }

    res.json(recette);
});


// API pour ajouter une nouvelle recette
app.post('/api/recettes', upload.single('image'), (req, res) => {
    const { title, ingredients, preparations } = req.body;

    // Vérification de la présence des champs requis
    if (!title || !ingredients || !preparations) {
        return res.status(400).send({ error: 'Le titre est requis.' });
    }

    // On suppose que le frontend envoie les ingrédients et préparations sous forme de JSON
    let ingredientList = [];
    let preparationList = [];

    try {
        ingredientList = JSON.parse(ingredients); // Convertir en tableau si c'est du JSON
    } catch (error) {
        return res.status(400).send({ error: 'Ingrédients doivent être un tableau JSON.' });
    }

    try {
        preparationList = JSON.parse(preparations); // Convertir en tableau si c'est du JSON
    } catch (error) {
        return res.status(400).send({ error: 'Préparations doivent être un tableau JSON.' });
    }

    // Créer la nouvelle recette avec un id unique
    const newRecette = {
        id: uuidv4(),  // Générer un identifiant unique pour la recette
        title,
        ingredients: ingredientList,
        preparations: preparationList,
        image: req.file ? `/uploads/${req.file.filename}` : null
    };

    // Récupérer les recettes existantes
    const recettes = readRecettes();

    // Ajouter la nouvelle recette à la liste
    recettes.push(newRecette);

    // Sauvegarder les recettes mises à jour dans le fichier JSON
    writeRecettes(recettes);

    // Retourner la recette ajoutée dans la réponse
    res.status(201).send(newRecette);
});

// API pour supprimer une recette par son id
app.delete('/api/recettes/:id', (req, res) => {
    const recetteId = req.params.id;

    // Charger les recettes depuis le fichier JSON
    const recettes = readRecettes();

    // Trouver la recette à supprimer
    const recette = recettes.find(recette => recette.id === recetteId);
    if (!recette) {
        return res.status(404).send({ error: 'Recette non trouvée' });
    }

    // Supprimer l'image associée si elle existe
    if (recette.image) {
        const imagePath = path.join(__dirname, 'public', recette.image);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Erreur lors de la suppression de l'image : ${imagePath}`, err);
            } else {
                console.log(`Image supprimée : ${imagePath}`);
            }
        });
    }

    // Filtrer les recettes pour exclure celle avec l'id correspondant
    const nouvellesRecettes = recettes.filter(recette => recette.id !== recetteId);

    // Sauvegarder les recettes mises à jour dans le fichier JSON
    writeRecettes(nouvellesRecettes);

    // Réponse à la demande de suppression
    res.status(200).send('Recette supprimée');
});

app.put('/api/recettes/:id', (req, res) => {
    const recetteId = req.params.id;
    const { title, ingredients, preparations } = req.body;

    if (!title || !ingredients || !preparations) {
        return res.status(400).send({ error: 'Les champs titre, ingrédients et préparations sont requis.' });
    }

    const recettes = readRecettes();
    const recetteIndex = recettes.findIndex(r => r.id === recetteId);

    if (recetteIndex === -1) {
        return res.status(404).send({ error: 'Recette non trouvée' });
    }

    recettes[recetteIndex] = {
        ...recettes[recetteIndex],
        title,
        ingredients,
        preparations
    };

    writeRecettes(recettes);

    res.status(200).send(recettes[recetteIndex]);
});


// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
