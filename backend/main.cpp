#include "crow.h"
#include <cpr/cpr.h>
#include <iostream>
#include <string>

// thank you mr internet

const std::string FIVE_CALLS_API_TOKEN = "";
const std::string GOOGLE_CIVIC_TOKEN = "";
const std::string CONGRESS_API_TOKEN = "";

struct CORS
{
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&)
    {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
    }

    void after_handle(crow::request& req, crow::response& res, context&) 
    {
        if (res.get_header_value("Access-Control-Allow-Origin").empty())
        {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
        }
    }
};

static inline void add_cors(crow::response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
}

int main()
{
    crow::App<CORS> app;

    static std::string storedString;

    // Test endpoint
    CROW_ROUTE(app, "/")([] {
        crow::response res(200, "OK Civic backend is up");
        add_cors(res);
        return res;
    });

    // Health check
    CROW_ROUTE(app, "/api/health").methods(crow::HTTPMethod::GET, crow::HTTPMethod::OPTIONS)
    ([](const crow::request& req){
        crow::response res;
        if (req.method == crow::HTTPMethod::OPTIONS) {
            res.code = 204;
        } else {
            crow::json::wvalue body;
            body["ok"] = true;
            res = crow::response{body};
            res.set_header("Content-Type", "application/json");
        }
        add_cors(res);
        return res;
    });

    // Save address string from user
    CROW_ROUTE(app, "/save_string").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/save_string").methods("POST"_method)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        if (!body) {
            crow::response res(400, "Invalid JSON");
            add_cors(res);
            return res;
        }

        storedString = body["text"].s();
        std::cout << "Stored address: " << storedString << std::endl;
        crow::response res(200, "Stored successfully!");
        add_cors(res);
        return res;
    });

    // Get stored string
    CROW_ROUTE(app, "/get_string").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/get_string").methods("GET"_method)([](){
        crow::json::wvalue x;
        x["storedString"] = storedString;
        crow::response res(x);
        add_cors(res);
        return res;
    });


  //more fucking google
    CROW_ROUTE(app, "/api/elections").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/elections").methods("GET"_method)([](){
        crow::response res;
        
        std::string apiUrl = "https://www.googleapis.com/civicinfo/v2/elections";
        
        std::cout << "Fetching elections from Google Civic API" << std::endl;
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{{"key", GOOGLE_CIVIC_TOKEN}}
        );

        std::cout << "Google Civic API Status: " << apiResponse.status_code << std::endl;
        std::cout << "Response: " << apiResponse.text.substr(0, 300) << "..." << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch elections from Google Civic API";
            error["status"] = apiResponse.status_code;
            error["message"] = apiResponse.text;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });


    // google api ts blows asss
    CROW_ROUTE(app, "/api/voter_info").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/voter_info").methods("POST"_method)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        crow::response res;
        
        if (!body || !body.has("address")) {
            res.code = 400;
            res.body = R"({"error": "Missing address field in request body"})";
            res.set_header("Content-Type", "application/json");
            add_cors(res);
            return res;
        }

        std::string address = body["address"].s();
        

        std::string electionId = "2000"; 
        if (body.has("electionId")) {
            electionId = std::to_string(body["electionId"].i());
        }
        
        std::cout << "=== Getting voter info for address: " << address << std::endl;
        
        std::string apiUrl = "https://www.googleapis.com/civicinfo/v2/voterinfo";
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{
                {"key", GOOGLE_CIVIC_TOKEN},
                {"address", address},
                {"electionId", electionId}
            }
        );
        
        std::cout << "Google Civic API Status: " << apiResponse.status_code << std::endl;
        std::cout << "Response: " << apiResponse.text.substr(0, 500) << "..." << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
            std::cout << "✓ Successfully fetched voter info" << std::endl;
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch voter info from Google Civic API";
            error["status"] = apiResponse.status_code;
            error["apiResponse"] = apiResponse.text;
            error["address"] = address;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
            std::cout << "✗ Failed to fetch voter info" << std::endl;
        }
        
        add_cors(res);
        return res;
    });

    // GOOGLE CIVIC API
    CROW_ROUTE(app, "/api/google_reps").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/google_reps").methods("POST"_method)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        crow::response res;
        
        if (!body || !body.has("address")) {
            res.code = 400;
            res.body = R"({"error": "Missing address field in request body"})";
            res.set_header("Content-Type", "application/json");
            add_cors(res);
            return res;
        }

        std::string address = body["address"].s();
        
        std::cout << "=== Getting representatives for address: " << address << std::endl;
        
        std::string apiUrl = "https://www.googleapis.com/civicinfo/v2/representatives";
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{
                {"key", GOOGLE_CIVIC_TOKEN},
                {"address", address}
            }
        );
        
        std::cout << "Google Civic API Status: " << apiResponse.status_code << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
            std::cout << "✓ Successfully fetched representatives" << std::endl;
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch representatives from Google Civic API";
            error["status"] = apiResponse.status_code;
            error["apiResponse"] = apiResponse.text;
            error["address"] = address;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });

    // the congress better keep this shit free

    CROW_ROUTE(app, "/api/bills").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/bills").methods("GET"_method)([](){
        crow::response res;
        
        std::string apiUrl = "https://api.congress.gov/v3/bill";
        
        std::cout << "Fetching recent bills from Congress.gov API" << std::endl;
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{
                {"api_key", CONGRESS_API_TOKEN},
                {"format", "json"},
                {"limit", "20"}
            }
        );

        std::cout << "Congress API Status: " << apiResponse.status_code << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
            std::cout << "✓ Successfully fetched bills" << std::endl;
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch bills from Congress.gov API";
            error["status"] = apiResponse.status_code;
            error["message"] = apiResponse.text;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });

    // CONGRESS.GOV API - Get Member Info

    CROW_ROUTE(app, "/api/members").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/members").methods("GET"_method)([](){
        crow::response res;
        
        std::string apiUrl = "https://api.congress.gov/v3/member";
        
        std::cout << "Fetching Congress members" << std::endl;
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{
                {"api_key", CONGRESS_API_TOKEN},
                {"format", "json"},
                {"limit", "20"}
            }
        );

        std::cout << "Congress API Status: " << apiResponse.status_code << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
            std::cout << "✓ Successfully fetched members" << std::endl;
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch members from Congress.gov API";
            error["status"] = apiResponse.status_code;
            error["message"] = apiResponse.text;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });


    // 5 CALLS API 
 
    CROW_ROUTE(app, "/api/get_reps").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/get_reps").methods("GET"_method)([](){
        crow::response res;
        
        if (storedString.empty()) {
            res.code = 400;
            res.body = R"({"error": "No address stored. Please save an address first."})";
            res.set_header("Content-Type", "application/json");
            add_cors(res);
            return res;
        }

        std::string apiUrl = "https://api.5calls.org/v1/reps";
        
        std::cout << "Calling 5 Calls API with location: " << storedString << std::endl;
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{{"location", storedString}},
            cpr::Header{{"X-5Calls-Token", FIVE_CALLS_API_TOKEN}}
        );

        std::cout << "5 Calls API Status: " << apiResponse.status_code << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch from 5 Calls API";
            error["status"] = apiResponse.status_code;
            error["message"] = apiResponse.text;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/lookup_reps").methods("OPTIONS"_method)([](){
        crow::response res(204);
        add_cors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/lookup_reps").methods("POST"_method)([](const crow::request& req){
        auto body = crow::json::load(req.body);
        crow::response res;
        
        if (!body || !body.has("address")) {
            res.code = 400;
            res.body = R"({"error": "Missing address field in request body"})";
            res.set_header("Content-Type", "application/json");
            add_cors(res);
            return res;
        }

        std::string address = body["address"].s();
        
        std::cout << "=== Looking up reps for address: " << address << std::endl;
        
        std::string apiUrl = "https://api.5calls.org/v1/reps";
        
        cpr::Response apiResponse = cpr::Get(
            cpr::Url{apiUrl},
            cpr::Parameters{{"location", address}},
            cpr::Header{{"X-5Calls-Token", FIVE_CALLS_API_TOKEN}}
        );
        
        std::cout << "Status: " << apiResponse.status_code << std::endl;

        if (apiResponse.status_code == 200) {
            res.code = 200;
            res.body = apiResponse.text;
            res.set_header("Content-Type", "application/json");
            std::cout << "✓ Successfully fetched data from 5 Calls" << std::endl;
        } else {
            res.code = apiResponse.status_code;
            crow::json::wvalue error;
            error["error"] = "Failed to fetch from 5 Calls API";
            error["status"] = apiResponse.status_code;
            error["apiResponse"] = apiResponse.text;
            error["address"] = address;
            res.body = error.dump();
            res.set_header("Content-Type", "application/json");
        }
        
        add_cors(res);
        return res;
    });

    std::cout << "========================================" << std::endl;
    std::cout << "Server starting on port 8080..." << std::endl;
    std::cout << "5 Calls API Token: " << (FIVE_CALLS_API_TOKEN.empty() ? "NOT SET" : "✓ Configured") << std::endl;
    std::cout << "Google Civic API Token: " << (GOOGLE_CIVIC_TOKEN.empty() ? "NOT SET" : "✓ Configured") << std::endl;
    std::cout << "Congress.gov API Token: " << (CONGRESS_API_TOKEN.empty() ? "NOT SET" : "✓ Configured") << std::endl;
    std::cout << "========================================" << std::endl;
    
    app.port(8080).multithreaded().run();
}