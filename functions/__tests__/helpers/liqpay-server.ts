// @ts-ignore
import express from "express";
// @ts-ignore
import http from "http";

class LiqPayServer {
  private app: express.Application | null = null;
  private server: http.Server | null = null;

  async start(callback: (app: express.Application) => void): Promise<void> {
    await this.close();
    this.app = express();
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    callback(this.app!);
    return new Promise((resolve, reject) => {
      this.server = this.app!.listen(3000, () => {
        resolve();
      });
    });
  }

  async close(): Promise<void> {
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server!.close(() => {
          resolve();
        });
      });
    }
  }
}

const liqPayServer = new LiqPayServer();

// Export the server for closing later
export default liqPayServer;
