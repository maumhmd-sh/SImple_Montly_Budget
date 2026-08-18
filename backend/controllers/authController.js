import bcrypt from 'bcrypt'

import pool from '../config/database.js'

import {
  generateToken
} from '../utils/jwt.js'


/**
 * REGISTER
 */
export async function register(req, res) {

  try {

    const {
      name,
      email,
      password
    } = req.body


    // ================================
    // VALIDATION
    // ================================

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Nama, email, dan password wajib diisi.'
      })

    }


    const cleanName =
      String(name).trim()


    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase()


    if (cleanName.length < 2) {

      return res.status(400).json({
        success: false,
        message:
          'Nama minimal 2 karakter.'
      })

    }


    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          'Password minimal 6 karakter.'
      })

    }


    // ================================
    // CHECK EMAIL
    // ================================

    const [existingUsers] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail]
      )


    if (existingUsers.length > 0) {

      return res.status(409).json({
        success: false,
        message:
          'Email sudah terdaftar.'
      })

    }


    // ================================
    // HASH PASSWORD
    // ================================

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      )


    // ================================
    // INSERT USER
    // ================================

    const [result] =
      await pool.execute(
        `
        INSERT INTO users
        (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
        `,
        [
          cleanName,
          cleanEmail,
          passwordHash
        ]
      )


    const user = {

      id: result.insertId,

      name: cleanName,

      email: cleanEmail

    }


    // ================================
    // TOKEN
    // ================================

    const token =
      generateToken(user)


    return res.status(201).json({

      success: true,

      message:
        'Registrasi berhasil.',

      data: {

        user,

        token

      }

    })


  } catch (error) {

    console.error(
      'REGISTER ERROR:',
      error
    )


    return res.status(500).json({

      success: false,

      message:
        'Terjadi kesalahan pada server.'

    })

  }

}


/**
 * LOGIN
 */
export async function login(req, res) {

  try {

    const {
      email,
      password
    } = req.body


    // ================================
    // VALIDATION
    // ================================

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Email dan password wajib diisi.'

      })

    }


    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase()


    // ================================
    // FIND USER
    // ================================

    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          password_hash,
          created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail]
      )


    if (users.length === 0) {

      return res.status(401).json({

        success: false,

        message:
          'Email atau password salah.'

      })

    }


    const userFromDatabase =
      users[0]


    // ================================
    // CHECK PASSWORD
    // ================================

    const passwordValid =
      await bcrypt.compare(
        password,
        userFromDatabase.password_hash
      )


    if (!passwordValid) {

      return res.status(401).json({

        success: false,

        message:
          'Email atau password salah.'

      })

    }


    // ================================
    // USER DATA
    // ================================

    const user = {

      id: userFromDatabase.id,

      name: userFromDatabase.name,

      email: userFromDatabase.email,

      created_at:
        userFromDatabase.created_at

    }


    // ================================
    // GENERATE JWT
    // ================================

    const token =
      generateToken(user)


    return res.json({

      success: true,

      message:
        'Login berhasil.',

      data: {

        user,

        token

      }

    })


  } catch (error) {

    console.error(
      'LOGIN ERROR:',
      error
    )


    return res.status(500).json({

      success: false,

      message:
        'Terjadi kesalahan pada server.'

    })

  }

}


/**
 * GET CURRENT USER
 */
export async function me(req, res) {

  try {

    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [req.user.id]
      )


    if (users.length === 0) {

      return res.status(404).json({

        success: false,

        message:
          'User tidak ditemukan.'

      })

    }


    return res.json({

      success: true,

      data: {

        user: users[0]

      }

    })


  } catch (error) {

    console.error(
      'ME ERROR:',
      error
    )


    return res.status(500).json({

      success: false,

      message:
        'Terjadi kesalahan pada server.'

    })

  }

}