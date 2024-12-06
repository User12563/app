// 🌐 FAST FOOD APP - APPLICATION COMPLÈTE

// 📦 IMPORTS PRINCIPAUX
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js';

// 🎨 STYLES GLOBAUX & TAILWIND
const GlobalStyle = styled.div`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #f4f4f4;
  }
`;

// 🔐 CONFIGURATION AUTHENTIFICATION
const AUTH_CONFIG = {
  SECRET_KEY: 'fastfood_secret_2023',
  TOKEN_EXPIRATION: '24h'
};

// 🗂️ REDUX - GESTION STATE
const initialState = {
  panier: [],
  utilisateur: null,
  commandes: []
};

function rootReducer(state = initialState, action) {
  switch(action.type) {
    case 'AJOUTER_PANIER':
      return { ...state, panier: [...state.panier, action.payload] };
    case 'CONNECTER_UTILISATEUR':
      return { ...state, utilisateur: action.payload };
    default:
      return state;
  }
}

const store = createStore(rootReducer);

// 🍔 COMPOSANT MENU PRINCIPAL
function MenuPrincipal() {
  const [categories, setCategories] = useState([
    { id: 1, nom: 'Burgers', image: 'burger.jpg' },
    { id: 2, nom: 'Pizzas', image: 'pizza.jpg' }
  ]);

  const [produits, setProduits] = useState([]);

  useEffect(() => {
    // Chargement dynamique des produits
    axios.get('/api/produits')
      .then(response => setProduits(response.data));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4"
    >
      {categories.map(categorie => (
        <motion.div 
          key={categorie.id}
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-lg shadow-md p-4 m-2"
        >
          <h2>{categorie.nom}</h2>
          {produits
            .filter(p => p.categorie === categorie.nom)
            .map(produit => (
              <div key={produit.id}>
                {produit.nom} - {produit.prix}€
              </div>
            ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

// 🔒 COMPOSANT AUTHENTIFICATION
function Authentification() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const connecter = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/connexion', { 
        email, 
        motDePasse 
      });
      
      // Stockage token
      localStorage.setItem('token', response.data.token);
    } catch (erreur) {
      console.error('Erreur connexion');
    }
  };

  return (
    <form onSubmit={connecter}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit">Connexion</button>
    </form>
  );
}

// 💳 COMPOSANT PAIEMENT
function Paiement() {
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    loadStripe('pk_test_votrecle').then(setStripe);
  }, []);

  const payerCommande = async () => {
    if (!stripe) return;

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: 'prix_example', quantity: 1 }],
      mode: 'payment',
      successUrl: '/confirmation',
      cancelUrl: '/annulation'
    });
  };

  return (
    <button onClick={payerCommande}>
      Payer ma commande
    </button>
  );
}

// 🌍 COMPOSANT APPLICATION PRINCIPALE
function App() {
  return (
    <Provider store={store}>
      <GlobalStyle>
        <div className="app">
          <Authentification />
          <MenuPrincipal />
          <Paiement />
        </div>
      </GlobalStyle>
    </Provider>
  );
}

// 🚀 EXPORT
export default App;

// 💾 CONFIGURATION BACKEND (SIMULÉ)
const configServeur = {
  port: 5000,
  database: {
    url: 'mongodb://localhost/fastfood',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

// 🔍 FONCTIONS UTILITAIRES
function verifierAuthentification(token) {
  // Logique vérification JWT
  return true;
}

function genererNumeroCommande() {
  return `CMD-${Date.now()}`;
}
