import { serve } from "https://deno.land/std@0.75.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.75.0/ws/mod.ts";
var blacklist = [];
const server = serve(":8080");
console.log(`Chat server is running on 8080`);
let users = [];
for await (const req of server) {
    try {
        const { conn, r: bufReader, w: bufWriter, headers } = req;
        let socket = await acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers,
        });
        try {
            handleWs(socket);
        }
        catch (err) {
            console.error(`failed to receive frame: ${err}`);
            if (!socket.isClosed) {
                await socket.close(1000).catch(console.error);
            }
        }
    }
    catch (error) {
        try {
            let headers = new Headers();
            let data;
            if (req.url === "/" || req.url === "/index.html") {
                headers.set("Content-Type", "text/html");
                data = await Deno.readTextFile("index.html");
            }
            else if (req.url === "/style.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("style.css");
            }
            else if (req.url === "/frontend.js") {
                headers.set("Content-Type", "text/javascript");
                data = await Deno.readTextFile("frontend.js");
            }
            else if (req.url === "/modern.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("modern.css");
            }
            else if (req.url === "/retrored.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("retrored.css");
            }
            else if (req.url === "/retropurple.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("retropurple.css");
            }
            else if (req.url === "/round.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("round.css");
            }
            else {
                throw 404;
            }
            await req.respond({ status: 200, body: data, headers: headers });
        }
        catch {
            await req.respond({ status: 404 });
        }
    }
}
async function handleWs(socket) {
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
                    }));
                    return true;
                }
                catch {
                    return false;
                }
            });
            setTimeout(update, 1000);
        }
        update();
        if (typeof event === "string") {
            const parsedEvent = JSON.parse(event);
            if (parsedEvent.type === "open") {
                users.push(socket);
                if (users.length > 1) {
                    var datetime = new Date();
                    var time = datetime.getHours() + ":" + datetime.getMinutes();
                    await socket.send(JSON.stringify({
                        type: "message",
                        data: {
                            name: "henrybot",
                            message: "Hey, welcome to henrychat! There are " + users.length + " users online rn &#129472;",
                            users: users.length,
                            channel: "any"
                        }
                    }));
                }
                else {
                    await socket.send(JSON.stringify({
                        type: "message",
                        data: {
                            name: "henrybot",
                            message: "Hey, welcome to henrychat! seems like you're the only person online. (for now)",
                            channel: "any"
                        }
                    }));
                }
            }
            else if (parsedEvent.type === "ip") {
                console.log("New connection from " + parsedEvent.ip);
            }
            else if (parsedEvent.type === "message") {
                console.dir(parsedEvent);
                users = users.filter(user => {
                    try {
                        user.send(JSON.stringify(parsedEvent));
                        return true;
                    }
                    catch {
                        return false;
                    }
                });
                console.log(`There ${users.length === 1 ? "is" : "are"} ${users.length} ${users.length === 1 ? "user" : "users"} online`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sNkNBQTZDLENBQUE7QUFDbkUsT0FBTyxFQUFFLGVBQWUsRUFBYSxNQUFNLHdDQUF3QyxDQUFBO0FBRW5GLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUVsQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdDLElBQUksS0FBSyxHQUFnQixFQUFFLENBQUE7QUFFM0IsSUFBSSxLQUFLLEVBQUUsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO0lBQzVCLElBQUk7UUFDQSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUE7UUFDekQsSUFBSSxNQUFNLEdBQUcsTUFBTSxlQUFlLENBQUM7WUFDL0IsSUFBSTtZQUNKLFNBQVM7WUFDVCxTQUFTO1lBQ1QsT0FBTztTQUNWLENBQUMsQ0FBQTtRQUVGLElBQUk7WUFDQSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDbkI7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFFaEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ2hEO1NBQ0o7S0FFSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osSUFBSTtZQUVBLElBQUksT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7WUFDM0IsSUFB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