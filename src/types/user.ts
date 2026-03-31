/* För att undvika att ha 'any' när man request users så behövs ett interface som berättar för TS vad den kan förvänta sig */

export interface JwtUser {
  id: number;
}

/* Källa: https://blog.logrocket.com/extend-express-request-object-typescript/ */