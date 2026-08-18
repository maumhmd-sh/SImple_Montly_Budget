const jwt = require('jsonwebtoken')


function authMiddleware(
  req,
  res,
  next
) {

  try {

    const authorization =
      req.headers.authorization


    if (
      !authorization ||
      !authorization.startsWith('Bearer ')
    ) {

      return res.status(401).json({

        success: false,

        message:
          'Token tidak ditemukan.'

      })

    }


    const token =
      authorization.split(' ')[1]


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

      message:
        'Token tidak valid atau sudah expired.'

    })

  }

}


module.exports =
  authMiddleware