import pkg from 'pg';
const {Pool} = pkg
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import{promisify} from 'util'
import { resolveSoa } from 'dns';


const pool = new Pool({
    user: 'hartiel',
    host: 'localhost',
    database: 'lokkeroom',
    password: 'caravane',
    port: 5432
})

const Port = 3000;

const server = express()

const sign = promisify(jwt.sign)
const verify = promisify(jwt.verify)

server.use(express.json())

server.post('api/register', async (req, res) => {
    const {email,nickname,password} = req.body

    if(!email || !nickname || !password)
        return res.status(400).send({ error: 'requet invalide'})

    try{
        const encryptedPassword = await bcrypt.hash(password, 10)

        await pool.query('INSERT INTO users (email, nickname, password) VALUES ($1, $2, $3)', [email, nickname, encryptedPassword])

        return res.send({info:'utilisateur créé avec sucess'})

    } catch{err}{
        return resolveSoa.status(500).send({error: 'erreur lors de la création de lutilisateur'})
    }
})
server.post('/api/login', async (req, res) => {
    const {email,password} = req.body
    
    if(!email || !password)
        return res.status(400).send({ error: 'requet invalide'})
    
        const q = await pool.query('SELECT password, id, nickname FROM users WHERE email = $1',[email])

    if(q.rowCount===0){
        return res.status(404).send({ error: 'utilisateur inconnu'})
    }

    const result = q.rows[0]
    const match = await bcrypt.compare(password, result.password)

    if(!match){
        return res.status(403).send({ error: 'mot de passe incorrect'})
    }

    try{
        const token = await sign(
            { id:result.id, nickname: result.nickname, email },
            proccess.env.JWT_SECRET,
            {algorithm: 'HS256',
            expiresIn: '1h'
            }

        )
        return res.send({token})
    } catch(err){
        console.log(err)
        return res.status(500).send({error: 'erreur lors de la création du token'})
    }
})


server.use(async(req, res, next) => {
    if (!req.headers.authorization)
        return res.status(401).send({ error: 'Pas dauthorization'})
    
    try{
        const decoded = await verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)

    if (decoded !== undefined){
        req.user = decoded
        return next()
    }
    } catch(err){
        console.log(err)
    }
    return res.status(403).send({ error: 'token invalide'})
})




server.get('/', (req, res) => {
    res.send('Hello World!')
    })
server.get('/api/users', async (req, res) => {
    const users = await pool.query(`SELECT * FROM users`);
    res.send(users.rows)
})

server.get('/api/users/:id', async (req, res) => {
   const {id} = req.params
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`,[id]);
    res.send(user.rows[0])
})
server.get('/api/lobby/:id', async (req, res) => {
    const {id} = req.params
    const lobby = await pool.query(`SELECT * FROM lobby WHERE id = $1`,[id]);
    res.json(lobby.rows[0])
})
server.get('/api/lobby/:id/messages', async (req, res) => {
    const {lobby_id} = req.params
    const q = await pool.query('SELECT text from public.messages WHERE lobby_id = $1',[lobby_id])
    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'aucun message' })
    }
    return res.send(q.rows)
    
})
server.get('/api/lobby/:id/messages/:message_id', async (req, res) => {
    const {lobby_id} = req.params
    const {message_id} = req.params
    const q = await pool.query('SELECT text from public.messages WHERE lobby_id = $1 AND id = $2',[lobby_id, message_id])
    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'se message existe pas' })
    }
    return res.send(q.rows)
    
  })
server.post('/api/lobby/:id/add-user', async (req, res) => {
    const {user_id} = req.body
    const {lobby_id} = req.params
    
      try {

        await pool.query('INSERT INTO public.users_in_lobby (lobby_id, user_id) VALUES ($1, $2)',[lobby_id, user_id])
    
        return res.send({ info: 'insersion de l utilisateur dans le lobby' })
      } catch (err) {
        console.log(err)
    
        return res.status(500).send({ error: 'server erreur' })
      }
  })
server.delete('/api/lobby/:lobby_id/remove-user', async (req, res) => {
    const {user_id} = req.body
    const {lobby_id} = req.params

    const isUserInLobby = await pool.query('SELECT user_id FROM public.users_in_lobby WHERE lobby_id=$1 AND user_id=$2)',[lobby_id, user_id])
    if(isUserInLobby.rowCount===0){
      res.send('utilisateur inconnu')}
    
    else {
    
      try {

        await pool.query('DELETE * FROM public.users_in_lobby (lobby_id, user_id) WHERE lobby_id=$1 AND user_id=$2',[lobby_id, user_id])
    
        return res.send({ info: 'Utilisateur suprimé' })
      } catch (err) {
        console.log(err)
    
        return res.status(500).send({ error: 'serveur erreur' })
      }
    } 
  })







server.listen(Port,()=> console.log(`server started: http://localhost:${Port}/`))






