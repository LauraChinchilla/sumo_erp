import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdexqdspobjpmzactfow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZXhxZHNwb2JqcG16YWN0Zm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTk4ODIsImV4cCI6MjA2ODA3NTg4Mn0.aP7bwGRz8RKUHterJYqoOBSn2kb68sfBKh8cof25BQI';

export const supabase = createClient(supabaseUrl, supabaseKey);
