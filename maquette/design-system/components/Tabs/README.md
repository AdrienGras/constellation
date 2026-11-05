# Tabs

Onglets, rôle ARIA `tablist` ; flèches gauche/droite, Début, Fin. API simplifiée `items: [{ value, label, content }]`, `defaultValue`, `value`, `onValueChange`, `label` (nom accessible de la liste, obligatoire).

À l'implémentation : `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` de shadcn/ui. Usage principal : les **profils Silkhom** d'une fiche qui en a plusieurs (`dev-backend` : Java, Python, PHP, Net, Backend JS). Au-delà de six onglets, préférer un `Select`.
