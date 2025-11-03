# Configuración de PayPal

## Credenciales de PayPal

Para que el sistema de pagos funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes credenciales:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AUOTi0H097Cp4c2cw4cA2R8W0ubn8zZOUHEoDzi2y3LqYJPBs6nwQuIUDCCHlR5lMJE0kGzBfJ33iK8d
PAYPAL_SECRET_ID=EEwsB9VJKZ3V1ygl893jhHQtUuP1l30cidZLN3sXoY4hSc8jr86eEAsOibF47218hLcqO_jLozEtJCwy
```

## Pasos para configurar

1. Crea un archivo llamado `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`)

2. Copia y pega las credenciales de arriba en el archivo

3. Guarda el archivo

4. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Modo de prueba vs Producción

Actualmente estás usando credenciales de **Sandbox (modo de prueba)** de PayPal.

### Para probar pagos:
- Usa las credenciales de sandbox proporcionadas
- Crea una cuenta de prueba en [PayPal Sandbox](https://developer.paypal.com/developer/accounts/)
- Usa las credenciales de prueba para hacer pagos ficticios

### Para producción:
- Obtén credenciales de producción desde [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- Reemplaza las credenciales en `.env.local`
- Asegúrate de que tu cuenta de PayPal esté verificada

## Flujo de pago

1. Usuario selecciona asientos
2. Click en "Proceder al Pago"
3. Se abre modal con botones de PayPal
4. Usuario completa el pago con PayPal
5. Al confirmar el pago, se muestra el ticket con código QR
6. Los asientos se marcan como ocupados

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca subas el archivo `.env.local` a Git
- El archivo `.env.local` ya está en `.gitignore`
- Las credenciales secretas solo deben estar en el servidor

## Soporte

Si tienes problemas con PayPal:
- Verifica que las credenciales sean correctas
- Revisa la consola del navegador para errores
- Consulta la [documentación de PayPal](https://developer.paypal.com/docs/)



