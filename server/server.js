const mongoose = require('mongoose');
const Document = require('./document')
mongoose.connect("mongodb://localhost:27017/google-docs-clone",
    { useNewUrlParser: true, useUnifiedTopology: true },
).then(() => console.log("Connected successfully")).catch((err) => { console.error(err) });

const io = require('socket.io')(3001, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const defaultValue = "";

io.on('connection', socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreatDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on("send-changes", delta => {
            console.log(delta);
            socket.broadcast.to(documentId).emit("receive changes", delta);
        });

        socket.on('save-document', async document => {
            await Document.findByIdAndUpdate(documentId, { data: data });
        });
    });
    console.log("connected...");
});

async function findOrCreatDocument(id) {
    if (id == null) return;
    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue });
}