# Frontend — Control de Acceso RFID

Panel web (React + Vite + Tailwind CSS) para el molinete:

- **Monitor de acceso**: muestra en vivo el último ingreso (n° de ficha, nombre, UID de tarjeta, permitido/denegado) y el historial de movimientos. Se actualiza solo cada 2 segundos.
- **Permitir acceso manual**: si llega una persona nueva (tarjeta denegada o sin tarjeta), un botón registra un acceso permitido manual.
- **Fichas**: alta de fichas nuevas (nombre + UID de tarjeta) y listado con activar/desactivar/eliminar.

## Cómo correrlo

1. Backend (desde `Backend/`, con el `.env` configurado — ver `.env.example` en la raíz):

   ```bash
   python manage.py runserver
   ```

2. Frontend (desde `Frontend/`):

   ```bash
   npm install
   npm run dev
   ```

   Abre en <http://localhost:5173> y consume la API en `http://localhost:8000/api`.

Si el backend corre en otra IP/puerto, crear `Frontend/.env.local` con:

```
VITE_API_URL=http://192.168.x.x:8000/api
```
