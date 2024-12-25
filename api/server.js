const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Configuration de multer pour gérer les fichiers d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public', 'uploads');
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

// Fonction utilitaire pour lire les recettes à partir du fichier JSON
const recettesFilePath = path.join(__dirname, '../recettes.json'); // Chemin vers le fichier JSON des recettes
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

// Création de l'API
app.get('/api/recettes', (req, res) => {
    const recettes = readRecettes();
    res.json(recettes);
});

app.get('/api/recettes/:id', (req, res) => {
    const recetteId = req.params.id;
    const recettes = readRecettes();
    const recette = recettes.find(r => r.id === recetteId);

    if (!recette) {
        return res.status(404).send({ error: 'Recette non trouvée' });
    }

    res.json(recette);
});

app.post('/api/recettes', upload.single('image'), (req, res) => {
    console.log("Données reçues:", req.body);
    const { title, ingredients, preparations } = req.body;

    // Vérification de la présence des champs requis
    if (!title || !ingredients || !preparations) {
        return res.status(400).json({ error: 'Le titre, les ingrédients et les préparations sont requis.' });
    }

    let ingredientList = [];
    let preparationList = [];

    try {
        ingredientList = JSON.parse(ingredients); // Convertir en tableau si c'est du JSON
    } catch (error) {
        return res.status(400).json({ error: 'Ingrédients doivent être un tableau JSON.' });
    }

    try {
        preparationList = JSON.parse(preparations); // Convertir en tableau si c'est du JSON
    } catch (error) {
        return res.status(400).json({ error: 'Préparations doivent être un tableau JSON.' });
    }

    const newRecette = {
        id: uuidv4(), // Générer un ID unique
        title,
        ingredients: ingredientList,
        preparations: preparationList,
        image: req.file ? `/uploads/${req.file.filename}` : null
    };

    const recettes = readRecettes();
    recettes.push(newRecette);
    writeRecettes(recettes);

    // Répondre avec la nouvelle recette
    res.status(201).json(newRecette); // Renvoi la recette créée en JSON
});

app.delete('/api/recettes/:id', (req, res) => {
    const recetteId = req.params.id;
    const recettes = readRecettes();
    const recette = recettes.find(recette => recette.id === recetteId);

    if (!recette) {
        return res.status(404).send({ error: 'Recette non trouvée' });
    }

    if (recette.image) {
        const imagePath = path.join(__dirname, '../public', recette.image);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Erreur lors de la suppression de l'image : ${imagePath}`, err);
            } else {
                console.log(`Image supprimée : ${imagePath}`);
            }
        });
    }

    const nouvellesRecettes = recettes.filter(recette => recette.id !== recetteId);
    writeRecettes(nouvellesRecettes);
    res.status(200).send('Recette supprimée');
});

// Exporter l'API comme une fonction handler pour Vercel
module.exports = (req, res) => {
    app(req, res); // Utilisation du serveur Express pour gérer la requête
};
