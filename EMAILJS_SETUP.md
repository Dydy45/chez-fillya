# 📧 Configuration EmailJS pour le système de réservation

## 🎯 Qu'est-ce qu'EmailJS ?

EmailJS permet d'envoyer des emails directement depuis le frontend JavaScript sans avoir besoin d'un serveur backend. C'est parfait pour les sites statiques comme le vôtre.

## 📋 Étapes de configuration

### 1. Créer un compte EmailJS
1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur "Sign Up" et créez un compte gratuit
3. Confirmez votre email

### 2. Configurer un service email
1. Dans votre dashboard EmailJS, allez dans "Email Services"
2. Cliquez sur "Add New Service"
3. Choisissez votre fournisseur email :
   - **Gmail** (recommandé pour commencer)
   - **Outlook**
   - **Yahoo**
   - **Autre SMTP**
4. Suivez les instructions pour connecter votre email
5. Notez le **Service ID** (ex: `service_abc123`)

### 3. Créer un template d'email
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Donnez un nom : "Réservation Chez Fillya"
4. Utilisez ce template :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Nouvelle Réservation - Chez Fillya</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6; text-align: center;">✨ Nouvelle Réservation ✨</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">📋 Détails de la réservation</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Service :</td>
                    <td style="padding: 8px;">{{service}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Date :</td>
                    <td style="padding: 8px;">{{date}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Heure :</td>
                    <td style="padding: 8px;">{{time}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Nom :</td>
                    <td style="padding: 8px;">{{name}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Téléphone :</td>
                    <td style="padding: 8px;">{{phone}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Email :</td>
                    <td style="padding: 8px;">{{email}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold; color: #666;">Message :</td>
                    <td style="padding: 8px;">{{message}}</td>
                </tr>
            </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #8B5CF6; color: white; border-radius: 10px;">
            <h3 style="margin: 0;">🎨 Chez Fillya</h3>
            <p style="margin: 10px 0 0 0;">Salon de coiffure premium à Kinshasa</p>
            <p style="margin: 5px 0;">📞 +243 80 00 00 00</p>
            <p style="margin: 5px 0;">📍 10 rue Lukunga, Lemba, Kinshasa</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            Cette réservation a été envoyée depuis le site web de Chez Fillya.
        </p>
    </div>
</body>
</html>
```

5. Sauvegardez le template
6. Notez le **Template ID** (ex: `template_xyz789`)

### 4. Récupérer votre clé publique
1. Allez dans "Account" → "API Keys"
2. Copiez votre **Public Key** (ex: `user_abc123def456`)

### 5. Configurer le code JavaScript
1. Ouvrez le fichier `js/main.js`
2. Trouvez la section CONFIG.EMAILJS
3. Remplacez les valeurs par les vôtres :

```javascript
EMAILJS: {
  SERVICE_ID: "service_abc123", // Votre Service ID
  TEMPLATE_ID: "template_xyz789", // Votre Template ID
  PUBLIC_KEY: "user_abc123def456" // Votre Public Key
}
```

## 🧪 Test du système

### Mode démonstration (actuel)
- Le système fonctionne en mode démo
- Les réservations sont affichées dans la console
- Pas d'envoi réel d'email

### Mode production (après configuration)
- Les réservations sont envoyées par email
- Vous recevez un email pour chaque réservation
- Le client reçoit une confirmation

## 📊 Limites gratuites EmailJS

- **200 emails/mois** gratuitement
- **1000 emails/mois** avec le plan payant
- **Illimité** avec le plan pro

## 🔧 Personnalisation

### Changer l'email de réception
Dans le template, vous pouvez ajouter :
```html
<p>Envoyé à : {{salon_email}}</p>
```

### Ajouter des validations
Dans `js/main.js`, vous pouvez ajouter des validations supplémentaires :
```javascript
// Exemple : vérifier les horaires
const selectedTime = new Date(`2024-01-01 ${booking.time}`);
const hour = selectedTime.getHours();
if (hour < 9 || hour > 19) {
  Utils.showNotification('Le salon est ouvert de 9h à 19h', 'error');
  return;
}
```

## 🚨 Sécurité

- **Ne partagez jamais** vos clés API
- **Utilisez HTTPS** en production
- **Limitez les emails** pour éviter le spam

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez vos clés dans la console
2. Testez avec l'email de test EmailJS
3. Contactez le support EmailJS

---

**Une fois configuré, votre système de réservation sera 100% fonctionnel !** 🎉