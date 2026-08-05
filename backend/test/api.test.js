// backend/test/api.test.js
const request = require("supertest");
// Sesuaikan path app express Anda jika server.js mengekspor app, 
// atau Anda bisa membuat file app.js terpisah yang di-require.
// Asumsi server.js menjalankan app, mari kita tes rute publik dasar.

const API_URL = "http://localhost:5050";

describe("Flojava Marketplace Backend API Integration Tests", () => {
  
  // Test 1: Cek Root Server
  test("GET / should return running message", async () => {
    const response = await request(API_URL).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Flojava Marketplace API Running...");
  });

  // Test 2: Cek Validasi Login Gagal (Email Kosong / Salah)
  test("POST /api/auth/login with empty credentials should fail", async () => {
    const response = await request(API_URL)
      .post("/api/auth/login")
      .send({ email: "", password: "" });
    
    expect(response.status).toBe(401); // Atau 400 tergantung rate-limit/validator
  });

  // Test 3: Cek Public Endpoint Produk / Ulasan
  test("GET /api/reviews/product/999999 should handle non-existent product", async () => {
    const response = await request(API_URL).get("/api/reviews/product/999999");
    expect(response.status).toBe(200); // Harus mengembalikan struktur data kosong, bukan crash server 500
  });

});