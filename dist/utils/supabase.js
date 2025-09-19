"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const testConnection = async () => {
    try {
        const { data, error } = await exports.supabase
            .from('products')
            .select('count', { count: 'exact', head: true });
        if (error) {
            console.log('Supabase connection test:', error.message);
            return false;
        }
        console.log('✅ Supabase connected successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=supabase.js.map