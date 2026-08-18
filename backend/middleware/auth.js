import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {

  const authorization =
    req.headers.authorization

  if (!authorization) {

    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak ditemukan.'
    })

  }


  const [scheme, token] =
    authorization.split(' ')


  if (
    scheme !== 'Bearer' ||
    !token
  ) {

    return res.status(401).json({
      success: false,
      message: 'Format token tidak valid.'
    })

  }


  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      )


    req.user = decoded

    next()

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa.'
    })

  }

}