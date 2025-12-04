# 🎨 Comment modifier l'apparence du Toggle (Switch)

## 📍 Fichier à modifier

**`app/components/ui/switch.tsx`**

---

## 🎨 Zones de modification des couleurs

### 1. **Couleur du fond quand activé (ON)** - Ligne 24 et 32

Actuellement : `#000000` (noir)

```tsx
// Ligne 24 - Animation
animate={{
  backgroundColor: checked ? '#000000' : '#e5e7eb',  // ← Changez '#000000' ici
}}

// Ligne 32 - Style inline (doit correspondre)
style={{ backgroundColor: checked ? '#000000' : '#e5e7eb' }}  // ← Changez '#000000' ici aussi
```

**Exemples de couleurs :**
- Vert : `'#22c55e'` ou `'#10b981'`
- Bleu : `'#3b82f6'` ou `'#2563eb'`
- Violet : `'#8b5cf6'` ou `'#7c3aed'`
- Rouge : `'#ef4444'` ou `'#dc2626'`
- Orange : `'#f97316'` ou `'#ea580c'`

### 2. **Couleur du fond quand désactivé (OFF)** - Ligne 24 et 32

Actuellement : `#e5e7eb` (gris clair)

```tsx
// Ligne 24 - Animation
animate={{
  backgroundColor: checked ? '#000000' : '#e5e7eb',  // ← Changez '#e5e7eb' ici
}}

// Ligne 32 - Style inline
style={{ backgroundColor: checked ? '#000000' : '#e5e7eb' }}  // ← Changez '#e5e7eb' ici aussi
```

**Exemples de couleurs grises :**
- Gris très clair : `'#f3f4f6'`
- Gris clair : `'#e5e7eb'` (actuel)
- Gris moyen : `'#d1d5db'`
- Gris foncé : `'#9ca3af'`

### 3. **Couleur de la boule blanche** - Ligne 35

Actuellement : `bg-white` (blanc)

```tsx
// Ligne 35
<motion.span
  className="absolute h-5 w-5 rounded-full bg-white shadow-lg"  // ← Changez 'bg-white' ici
  // ...
/>
```

**Exemples :**
- Blanc : `bg-white` (actuel)
- Gris très clair : `bg-gray-50`
- Gris clair : `bg-gray-100`
- Ou utilisez une couleur personnalisée : `style={{ backgroundColor: '#ffffff' }}`

### 4. **Couleur du focus ring** - Ligne 21

Actuellement : `focus:ring-black` (noir)

```tsx
// Ligne 21
className={`... focus:ring-black ...`}  // ← Changez 'focus:ring-black' ici
```

**Exemples :**
- Noir : `focus:ring-black` (actuel)
- Bleu : `focus:ring-blue-500`
- Vert : `focus:ring-green-500`
- Violet : `focus:ring-purple-500`

---

## 🎯 Exemple complet : Toggle vert au lieu de noir

```tsx
export function Switch({ checked, onChange, disabled = false, className = "" }: SwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        backgroundColor: checked ? '#22c55e' : '#e5e7eb',  // ← Vert au lieu de noir
      }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.2
      }}
      style={{ backgroundColor: checked ? '#22c55e' : '#e5e7eb' }}  // ← Vert au lieu de noir
    >
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-lg"
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      />
    </motion.button>
  );
}
```

---

## 🎨 Autres modifications possibles

### Taille du toggle
- **Ligne 21** : `h-6 w-11` → Changez pour `h-7 w-14` (plus grand) ou `h-5 w-9` (plus petit)

### Taille de la boule
- **Ligne 35** : `h-5 w-5` → Changez pour `h-6 w-6` (plus grande) ou `h-4 w-4` (plus petite)

### Ombre
- **Ligne 21** : `shadow-sm` → Changez pour `shadow-md`, `shadow-lg`, ou `shadow-none`
- **Ligne 35** : `shadow-lg` → Changez pour `shadow-md`, `shadow-xl`, ou `shadow-none`

### Animation
- **Lignes 27-31** : Modifiez `stiffness`, `damping`, `duration` pour changer la vitesse/fluidité
- **Lignes 43-47** : Même chose pour l'animation de la boule

---

## ⚠️ Important

**N'oubliez pas de modifier les deux endroits** :
1. Dans `animate={{ backgroundColor: ... }}` (ligne 24)
2. Dans `style={{ backgroundColor: ... }}` (ligne 32)

Les deux doivent avoir la même valeur pour que l'animation fonctionne correctement !

