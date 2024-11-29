import { Response } from 'miragejs'
import uniqueId from 'lodash/uniqueId'
import isEmpty from 'lodash/isEmpty'

export default function authFakeApi (server, apiPrefix) {
    
    server.post(`${apiPrefix}/auth/login`, (schema, {requestBody}) => {
        const { email, password } = JSON.parse(requestBody)
        const user = schema.db.signInUserData.findBy({ email, password })
        if (user) {
            return {
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFtaWw3MDdAZ21haWwuY29tIiwiZXhwIjoxNzM1MTExMjE3fQ.LMJ9_uRgNPkZ8KA2iznWiL87RS0ilioo5jAemWq_e30'
                }
            }
        }
        return new Response(401, { some: 'header' }, { message: `email: shamil707@gmail.com | password: admin@321` })
    })

    server.post(`${apiPrefix}/auth/loginInOAuth`, (schema) => {
        return {
            data: {
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
            }
        }
    })

    server.post(`${apiPrefix}/logout`, () => {
        return true
    })

    server.post(`${apiPrefix}/register`, (schema, {requestBody}) => {
        const { userName, password, email } = JSON.parse(requestBody)
        const emailUsed = schema.db.signInUserData.findBy({ email })
        const newUser = {
            userName,
            email,
        }

        if (!isEmpty(emailUsed)) {
            const errors = [
                {message: '', domain: "global", reason: "invalid"}
            ]
            return new Response(400, { some: 'header' }, { errors, message: 'User already used' })
        } 

        schema.db.signInUserData.insert({...newUser, ...{id: uniqueId('user_'), password, accountUserName: userName}})
        return {
            data: {
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
            }
        }
    })
}