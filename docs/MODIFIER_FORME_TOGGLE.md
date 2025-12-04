# 🎨 Comment modifier la forme du Toggle et ajouter des boules

## 📍 Fichier à modifier

**`app/components/ui/switch.tsx`**

---

## 🔵 La boule actuelle (qui glisse déjà)

La boule blanche qui glisse est déjà présente dans le code ! Elle se trouve aux **lignes 34-49**.

### Structure actuelle :

```tsx
<motion.span
  className="absolute h-5 w-5 rounded-full bg-white shadow-lg"  // ← La boule
  style={{
    left: '2px',
    top: '2px',
  }}
  animate={{ 
    x: checked ? 20 : 2,  // ← Animation : glisse de 2px (gauche) à 20px (droite)
  }}
  transition={{ 
    type: "spring", 
    stiffness: 500, 
    damping: 30,
    mass: 0.5
  }}
/>
```

---

## 🎯 Modifications possibles

### 1. **Changer la taille de la boule**

**Ligne 35** : Modifiez `h-5 w-5` (20px × 20px)

```tsx
// Plus petite
className="absolute h-4 w-4 rounded-full bg-white shadow-lg"  // 16px × 16px

// Plus grande
className="absolute h-6 w-6 rounded-full bg-white shadow-lg"  // 24px × 24px
```

### 2. **Changer la forme de la boule**

**Ligne 35** : Remplacez `rounded-full` (cercle) par :

```tsx
// Carré arrondi
className="absolute h-5 w-5 rounded-lg bg-white shadow-lg"

// Carré
className="absolute h-5 w-5 rounded-sm bg-white shadow-lg"

// Ovale
className="absolute h-5 w-8 rounded-full bg-white shadow-lg"  // Plus large que haut
```

### 3. **Changer la couleur de la boule**

**Ligne 35** : Remplacez `bg-white` par :

```tsx
// Couleurs Tailwind
className="absolute h-5 w-5 rounded-full bg-blue-500 shadow-lg"
className="absolute h-5 w-5 rounded-full bg-green-500 shadow-lg"
className="absolute h-5 w-5 rounded-full bg-purple-500 shadow-lg"

// Ou couleur personnalisée
style={{
  left: '2px',
  top: '2px',
  backgroundColor: '#3b82f6',  // Bleu
}}
```

### 4. **Ajuster la distance de glissement**

**Ligne 41** : Modifiez les valeurs de `x`

```tsx
animate={{ 
  x: checked ? 20 : 2,  // ← Changez ces valeurs
}}
```

**Calcul** :
- Toggle largeur : 44px (`w-11`)
- Boule largeur : 20px (`w-5`)
- Position OFF : `2px` (gauche)
- Position ON : `44px - 20px - 2px - 2px (padding) = 20px` (droite)

Pour un toggle plus grand (`w-16` = 64px) :
```tsx
x: checked ? 34 : 2,  // 64px - 28px - 2px = 34px
```

### 5. **Ajouter une deuxième boule (ou plus)**

Ajoutez un autre `<motion.span>` après la boule principale :

```tsx
{/* Boule principale */}
<motion.span
  className="absolute h-5 w-5 rounded-full bg-white shadow-lg"
  style={{ left: '2px', top: '2px' }}
  animate={{ x: checked ? 20 : 2 }}
  transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
/>

{/* Deuxième boule (plus petite, derrière) */}
<motion.span
  className="absolute h-3 w-3 rounded-full bg-gray-300 shadow-md"
  style={{ left: '4px', top: '50%', transform: 'translateY(-50%)' }}
  animate={{ 
    x: checked ? 18 : 4,
    opacity: checked ? 0.3 : 0.6,  // Disparaît quand activé
  }}
  transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.4 }}
/>
```

### 6. **Ajouter des boules décoratives (qui ne bougent pas)**

```tsx
{/* Petites boules décoratives sur les côtés */}
{!checked && (
  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-400" />
)}
{checked && (
  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/50" />
)}
```

### 7. **Changer la forme du toggle lui-même**

**Ligne 21** : Modifiez `rounded-full` (pilule)

```tsx
// Moins arrondi
className="... rounded-2xl ..."  // Arrondi moyen

// Carré arrondi
className="... rounded-lg ..."  // Arrondi léger

// Rectangle
className="... rounded-md ..."  // Très peu arrondi
```

---

## 🎨 Exemple complet : Toggle avec deux boules

```tsx
export function Switch({ checked, onChange, disabled = false, className = "" }: SwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        backgroundColor: checked ? '#000000' : '#e5e7eb',
      }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.2
      }}
      style={{ backgroundColor: checked ? '#000000' : '#e5e7eb' }}
    >
      {/* Boule principale (blanche, grande) */}
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-lg z-10"
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

      {/* Deuxième boule (petite, derrière) */}
      <motion.span
        className="absolute h-3 w-3 rounded-full bg-gray-300 shadow-sm z-0"
        style={{
          left: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        animate={{ 
          x: checked ? 18 : 4,
          opacity: checked ? 0.2 : 0.5,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          mass: 0.4
        }}
      />
    </motion.button>
  );
}
```

---

## 📐 Calculs pour ajuster les positions

### Pour un toggle `w-11` (44px) avec une boule `w-5` (20px) :
- Position OFF : `2px` (gauche)
- Position ON : `44px - 20px - 2px - 2px = 20px` (droite)

### Pour un toggle `w-16` (64px) avec une boule `w-7` (28px) :
- Position OFF : `2px` (gauche)
- Position ON : `64px - 28px - 2px - 6px = 28px` (droite)

**Formule générale** :
```
Position ON = (largeur_toggle - largeur_boule - left - padding) px
```

---

## 🎯 Zones clés à retenir

1. **Ligne 35** : Taille et forme de la boule (`h-5 w-5 rounded-full`)
2. **Ligne 41** : Distance de glissement (`x: checked ? 20 : 2`)
3. **Ligne 37-38** : Position initiale (`left: '2px', top: '2px'`)
4. **Ligne 43-47** : Vitesse/fluidité de l'animation (`stiffness`, `damping`, `mass`)

