# 📱 Configuration WhatsApp Business API pour les réservations

## 🎯 Qu'est-ce que WhatsApp Business API ?

WhatsApp Business API permet d'envoyer et recevoir des messages WhatsApp de manière automatisée. C'est parfait pour les réservations car c'est direct et personnel.

## 📋 Options de configuration

### **Option 1 : WhatsApp Business App (Recommandé)**
- ✅ **Gratuit** et simple
- ✅ **Numéro dédié** pour le salon
- ✅ **Réponses automatiques** possibles
- ✅ **Statistiques** des messages

### **Option 2 : WhatsApp Business API (Avancé)**
- ✅ **Automatisation complète**
- ✅ **Webhooks** pour notifications
- ✅ **Intégration** avec votre système
- ✅ **Gestion** de plusieurs numéros

## 🚀 Configuration WhatsApp Business App

### 1. Télécharger WhatsApp Business
1. Allez sur [Google Play Store](https://play.google.com/store/apps/details?id=com.whatsapp.w4b) ou [App Store](https://apps.apple.com/app/whatsapp-business/id1220993074)
2. Téléchargez **WhatsApp Business**
3. Installez l'application

### 2. Configurer le compte
1. **Ouvrez WhatsApp Business**
2. **Créez un compte** avec le numéro du salon
3. **Ajoutez les informations** du salon :
   - Nom : "Chez Fillya"
   - Description : "Salon de coiffure premium à Kinshasa"
   - Adresse : "10 rue Lukunga, Lemba, Kinshasa"
   - Horaires : "Lundi-Samedi 9h-19h, Dimanche 10h-17h"

### 3. Configurer les réponses automatiques
1. Allez dans **Paramètres** → **Réponses automatiques**
2. Créez ces réponses :

#### **Message de bienvenue :**
```
🎨 Bienvenue chez Chez Fillya !

Merci de nous avoir contacté. Nous sommes votre salon de coiffure premium à Kinshasa.

📋 Nos services :
• Coupe Homme/Femme
• Extensions
• Manucure & Pédicure
• Coloration

⏰ Horaires : Lundi-Samedi 9h-19h, Dimanche 10h-17h
📍 Adresse : 10 rue Lukunga, Lemba, Kinshasa

Pour une réservation, visitez notre site web ou répondez à ce message.
```

#### **Message d'absence :**
```
Merci de votre message ! 

Nous ne sommes pas disponibles actuellement. Nous vous répondrons dès que possible.

Pour une réservation urgente, appelez le +243 80 00 00 00.

À bientôt ! 🎨
```

### 4. Configurer le numéro dans le code
1. Ouvrez `js/main.js`
2. Trouvez la section CONFIG.WHATSAPP
3. Remplacez le numéro :

```javascript
WHATSAPP: {
  PHONE_NUMBER: "243800000000", // Votre vrai numéro WhatsApp
  BUSINESS_NAME: "Chez Fillya",
  SALON_EMAIL: "contact@chezfillya.cd"
}
```

## 🔧 Configuration WhatsApp Business API (Avancé)

### 1. Créer un compte Meta Business
1. Allez sur [Meta Business](https://business.facebook.com/)
2. Créez un compte Business
3. Vérifiez votre identité

### 2. Configurer WhatsApp Business API
1. Dans Meta Business, allez dans **WhatsApp**
2. Cliquez sur **Commencer**
3. Suivez les étapes de configuration
4. Notez votre **Phone Number ID** et **Access Token**

### 3. Configurer les webhooks
1. Créez un endpoint webhook sur votre serveur
2. Configurez les événements :
   - `messages`
   - `message_status`
   - `message_template_status`

### 4. Intégrer avec le code
```javascript
// Exemple d'envoi via API
const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: customerPhone,
    type: 'text',
    text: { body: message }
  })
});
```

## 🧪 Test du système

### Mode actuel (WhatsApp Web)
- ✅ **Ouvre WhatsApp Web** automatiquement
- ✅ **Pré-remplit le message** avec les détails
- ✅ **Sauvegarde locale** des réservations
- ✅ **Interface utilisateur** avec feedback

### Mode avancé (API)
- ✅ **Envoi automatique** des messages
- ✅ **Notifications** en temps réel
- ✅ **Gestion** des réponses
- ✅ **Statistiques** détaillées

## 📊 Avantages WhatsApp Business

### **Pour le salon :**
- ✅ **Contact direct** avec les clients
- ✅ **Réponse immédiate** possible
- ✅ **Gestion** des réservations en temps réel
- ✅ **Historique** des conversations
- ✅ **Statistiques** des messages

### **Pour les clients :**
- ✅ **Communication familière** (WhatsApp)
- ✅ **Réponse rapide** du salon
- ✅ **Confirmation** immédiate
- ✅ **Facilité** d'utilisation

## 🔧 Personnalisation

### Modifier le format du message
Dans `js/main.js`, fonction `formatWhatsAppMessage()` :

```javascript
return `🎨 *NOUVELLE RÉSERVATION - CHEZ FILLYA* 🎨

📋 *Détails de la réservation :*
• Service : ${serviceName}
• Date : ${formattedDate}
• Heure : ${booking.time}

👤 *Informations client :*
• Nom : ${booking.name}
• Téléphone : ${booking.phone}
• Email : ${booking.email}

💬 *Message :*
${booking.message || 'Aucun message'}

---
📞 Salon : +${CONFIG.WHATSAPP.PHONE_NUMBER}
📍 Adresse : 10 rue Lukunga, Lemba, Kinshasa
⏰ Horaires : Lundi-Samedi 9h-19h, Dimanche 10h-17h

*Cette réservation a été envoyée depuis le site web de Chez Fillya.*`;
```

### Ajouter des validations
```javascript
// Exemple : vérifier les horaires
const selectedTime = new Date(`2024-01-01 ${booking.time}`);
const hour = selectedTime.getHours();
if (hour < 9 || hour > 19) {
  Utils.showNotification('Le salon est ouvert de 9h à 19h', 'error');
  return;
}
```

## 🚨 Sécurité et bonnes pratiques

### **Sécurité :**
- ✅ **Ne partagez jamais** vos tokens API
- ✅ **Utilisez HTTPS** en production
- ✅ **Validez** les numéros de téléphone
- ✅ **Limitez** les messages pour éviter le spam

### **Bonnes pratiques :**
- ✅ **Répondez rapidement** aux messages
- ✅ **Utilisez des emojis** pour être plus chaleureux
- ✅ **Gardez un ton professionnel** mais amical
- ✅ **Confirmez** toujours les réservations
- ✅ **Remerciez** les clients

## 📞 Support

### **WhatsApp Business Support :**
- [Centre d'aide WhatsApp Business](https://business.whatsapp.com/help)
- [Documentation API](https://developers.facebook.com/docs/whatsapp)

### **En cas de problème :**
1. Vérifiez votre numéro dans le code
2. Testez l'envoi manuel sur WhatsApp
3. Vérifiez les permissions du navigateur
4. Contactez le support WhatsApp Business

---

**Une fois configuré, votre système de réservation WhatsApp sera 100% fonctionnel !** 🎉