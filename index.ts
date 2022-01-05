import { serve } from "https://deno.land/std@0.75.0/http/server.ts"
import { acceptWebSocket, WebSocket } from "https://deno.land/std@0.75.0/ws/mod.ts"

var blacklist = []

const server = serve(":8080")
console.log(`Chat server is running on 8080`)

let users: WebSocket[] = []

for await (const req of server) {
    try {
        const { conn, r: bufReader, w: bufWriter, headers } = req
        let socket = await acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers,
        })

        try {
            handleWs(socket)
        } catch (err) {
            console.error(`failed to receive frame: ${err}`)

            if (!socket.isClosed) {
                await socket.close(1000).catch(console.error)
            }
        }

    } catch (error) {
        try {

            let headers = new Headers()
            let data

            if (req.url === "/" || req.url === "/index.html") {
                headers.set("Content-Type", "text/html")
                data = await Deno.readTextFile("index.html")
            }
            else if (req.url === "/style.css") {
                headers.set("Content-Type", "text/css")
                data = await Deno.readTextFile("style.css")
            }
            else if (req.url === "/frontend.js") {
                headers.set("Content-Type", "text/javascript")
                data = await Deno.readTextFile("frontend.js")
            }
            else if (req.url === "/modern.css") {
                headers.set("Content-Type", "text/css")
                data = await Deno.readTextFile("modern.css")
            }
            else if (req.url === "/retrored.css") {
                headers.set("Content-Type", "text/css")
                data = await Deno.readTextFile("retrored.css")
            }
            else if (req.url === "/retropurple.css") {
                headers.set("Content-Type", "text/css")
                data = await Deno.readTextFile("retropurple.css")
            }
            else if (req.url === "/round.css") {
                headers.set("Content-Type", "text/css")
                data = await Deno.readTextFile("round.css")
            }
            else {
                throw 404
            }

            await req.respond({ status: 200, body: data, headers: headers })
        } catch {
            await req.respond({ status: 404 })
        }
    }
}

async function handleWs(socket: WebSocket) {
          
          for await (const event of socket) {

          function update() {
          users = users.filter(user => {
            try {
              user.send(JSON.stringify({
                type: "users",
                data: {
                  users: users.length,
                    name: "undefined"
                  }
              }))
              return true
              } catch {
              return false
              }
          })
          setTimeout(update, 1000);
        }

        update()
        if (typeof event === "string") {
            const parsedEvent = JSON.parse(event)
            if (parsedEvent.type === "open") {
                users.push(socket)
                if (users.length > 1) {
                  var datetime = new Date();
                  var time = datetime.getHours() + ":" + datetime.getMinutes()
                await socket.send(JSON.stringify({
                    type: "message",
                    data: {
                        name: "henrybot",
                        message: "Hey, welcome to henrychat! There are " + users.length + " users online rn &#129472;",
                        users: users.length,
                        channel: "any" 

                    }
                }))
                } else {

                  await socket.send(JSON.stringify({
                    type: "message",
                    data: {
                        name: "henrybot",
                        message: "Hey, welcome to henrychat! seems like you're the only person online. (for now)",
                        channel: "any"

                    }
                }))
                }
            }
            else if (parsedEvent.type === "ip") {
              console.log("New connection from " + parsedEvent.ip)
            }
             else if (parsedEvent.type === "message") {
                console.dir(parsedEvent)
                users = users.filter(user => {
                    try {
                        user.send(JSON.stringify(parsedEvent))
                        return true
                    } catch {
                        return false
                    }
                })
               
                console.log(`There ${users.length === 1 ? "is" : "are"} ${users.length} ${users.length === 1 ? "user" : "users"} online`)
            }
        }
    }
}