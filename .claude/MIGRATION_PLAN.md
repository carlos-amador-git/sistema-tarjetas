# Plan de Migración: Google Drive → ~/Projects/

## Resumen

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| **Ubicación** | Google Drive (sincronizado) | `~/Projects/sistema-tarjetas` (local) |
| **Backup** | Google Drive automático | Git + repositorio remoto |
| **Problemas resueltos** | Sincronización lenta, node_modules corrupto | Rendimiento nativo |

---

## Por qué migrar

### Problemas actuales con Google Drive:

1. **node_modules**: ~50,000+ archivos que se sincronizan constantemente
2. **Archivos binarios**: .prisma, .next causan conflictos
3. **Locks de archivo**: Google Drive puede bloquear archivos durante builds
4. **Latencia**: Operaciones de disco lentas por sincronización
5. **Watchman/HMR**: Hot reload puede fallar por cambios de Drive

---

## Plan de Ejecución

### Fase A: Preparación (5 min)

```bash
# 1. Verificar que no hay cambios sin guardar
cd "/Users/Marx/Library/CloudStorage/GoogleDrive-mdsamca2025@gmail.com/My Drive/App Banco Tarjeta/sistema-tarjetas-nextjs"
git status

# 2. Crear directorio destino
mkdir -p ~/Projects
```

### Fase B: Copia del Proyecto (2-3 min)

```bash
# 3. Copiar proyecto SIN node_modules ni .next
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dev.db' \
  --exclude 'playwright-report' \
  --exclude '.turbo' \
  "/Users/Marx/Library/CloudStorage/GoogleDrive-mdsamca2025@gmail.com/My Drive/App Banco Tarjeta/sistema-tarjetas-nextjs/" \
  ~/Projects/sistema-tarjetas/
```

### Fase C: Configuración en Nueva Ubicación (3-5 min)

```bash
# 4. Ir a nueva ubicación
cd ~/Projects/sistema-tarjetas

# 5. Instalar dependencias frescas
npm install

# 6. Generar cliente Prisma
npm run db:generate

# 7. Verificar que funciona
npm run dev
# Ctrl+C después de verificar que carga

# 8. Correr tests
npm test
```

### Fase D: Configurar Git Remoto (opcional pero recomendado)

```bash
# 9. Si no tienes repositorio remoto, crear uno en GitHub/GitLab
# Luego:
git remote add origin git@github.com:tu-usuario/sistema-tarjetas.git
git push -u origin main
```

### Fase E: Limpieza (después de verificar)

```bash
# 10. Una vez verificado que todo funciona en ~/Projects:
# OPCIONAL: Eliminar de Google Drive para evitar confusión
# rm -rf "/Users/Marx/Library/CloudStorage/GoogleDrive-mdsamca2025@gmail.com/My Drive/App Banco Tarjeta/sistema-tarjetas-nextjs"

# O mantener como backup pero agregar a .gitignore de Drive
```

---

## Comandos Resumidos (Copy-Paste)

```bash
# Ejecutar todo de una vez (después de aprobación):
mkdir -p ~/Projects && \
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dev.db' \
  --exclude 'playwright-report' \
  --exclude '.turbo' \
  "/Users/Marx/Library/CloudStorage/GoogleDrive-mdsamca2025@gmail.com/My Drive/App Banco Tarjeta/sistema-tarjetas-nextjs/" \
  ~/Projects/sistema-tarjetas/ && \
cd ~/Projects/sistema-tarjetas && \
npm install && \
npm run db:generate && \
npm test
```

---

## Verificación Post-Migración

| Check | Comando | Esperado |
|-------|---------|----------|
| Dev server | `npm run dev` | Carga en localhost:3000 |
| Tests | `npm test` | 91 tests passing |
| Build | `npm run build` | Sin errores |
| Prisma | `npm run db:studio` | Abre interfaz |

---

## Rollback

Si algo falla, el proyecto original sigue en Google Drive intacto.

```bash
# Volver a trabajar desde Google Drive temporalmente:
cd "/Users/Marx/Library/CloudStorage/GoogleDrive-mdsamca2025@gmail.com/My Drive/App Banco Tarjeta/sistema-tarjetas-nextjs"
```

---

## Estado

- [ ] Aprobado por usuario
- [ ] Fase A completada
- [ ] Fase B completada
- [ ] Fase C completada
- [ ] Fase D completada (opcional)
- [ ] Verificación exitosa
- [ ] Fase E completada (limpieza)

---

*Plan generado: 2026-01-22*
