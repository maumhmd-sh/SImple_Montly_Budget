import express from 'express'

import cors from 'cors'

import dotenv from 'dotenv'

import pool from './config/database.js'

import authRoutes from './routes/auth.js'


dotenv.config()


const app =
  express()


const PORT =
  Number(process.env.PORT || 3000)


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',

    credentials: true
  })
)


/*
|--------------------------------------------------------------------------
| BODY PARSER
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '1mb'
  })
)


app.use(
  express.urlencoded({
    extended: true
  })
)


/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  '/api/health',
  async (req, res) => {

    try {

      await pool.query(
        'SELECT 1'
      )


      res.json({

        success: true,

        message:
          'Monthly Budget API is running.',

        database:
          'connected',

        timestamp:
          new Date().toISOString()

      })

    } catch (error) {

      console.error(error)


      res.status(500).json({

        success: false,

        message:
          'Database connection failed.',

        database:
          'disconnected'

      })

    }

  }
)


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use(
  '/api/auth',
  authRoutes
)


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        'Endpoint tidak ditemukan.'

    })

  }
)


/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {

    console.error(
      'UNHANDLED ERROR:',
      error
    )


    res.status(500).json({

      success: false,

      message:
        'Internal server error.'

    })

  }
)


/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

async function startServer() {

  try {

    await pool.query(
      'SELECT 1'
    )


    console.log(
      '✓ MySQL connected'
    )


    app.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log('')
        console.log(
          '======================================'
        )

        console.log(
          '   MONTHLY BUDGET API'
        )

        console.log(
          '======================================'
        )

        console.log(
          `✓ Server : http://localhost:${PORT}`
        )

        console.log(
          `✓ Health : http://localhost:${PORT}/api/health`
        )

        console.log(
          '======================================'
        )

      }
    )

  } catch (error) {

    console.error(
      '✗ Failed to connect to MySQL'
    )

    console.error(
      error.message
    )

    process.exit(1)

  }

}


startServer()