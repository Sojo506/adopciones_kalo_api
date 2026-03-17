require("dotenv").config();
const app = require("./src/app");
const { initializePool, closePool } = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
    await initializePool();

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    let isShuttingDown = false;

    const shutdown = async (signal) => {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;
        console.log(`${signal} received. Closing server...`);

        server.close(async () => {
            try {
                await closePool();
                process.exit(0);
            } catch (error) {
                console.error('Error closing Oracle pool', error);
                process.exit(1);
            }
        });
    };

    process.on('SIGINT', () => {
        shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
        shutdown('SIGTERM');
    });
}

startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
