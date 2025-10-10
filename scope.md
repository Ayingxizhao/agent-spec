System learns FROM the senior SWE:
- Observes how they work
- Captures their corrections
- Learns company-specific patterns
- Internalizes domain expertise

Over time:
AI + Expert's Knowledge = Superhuman Assistant
- AI's broad knowledge + processing power
- Expert's specialized domain knowledge
- Company-specific patterns and constraints


1. User: "Create login endpoint"

2. System generates:
   def login(username, password):
       user = db.query(f"SELECT * FROM users WHERE name='{username}'")
       return user

3. Expert modifies:
   def login(username: str, password: str):
       if not username or not password:
           raise ValueError("Credentials required")
       user = db.query("SELECT * FROM users WHERE name=?", (username,))
       if bcrypt.checkpw(password, user.password_hash):
           return generate_token(user)
       raise AuthError()

4. AST Diff Analyzer:
   - Added: type hints
   - Added: input validation
   - Changed: SQL query (string format → parameterized)
   - Added: bcrypt password check
   - Changed: return type

5. Pattern Extractor (GPT-4o-mini):
   Extracts 3 patterns:
   - Input validation pattern
   - Parameterized query pattern  
   - Password hashing pattern

6. Pattern Repository:
   Stores patterns (confidence: 0.33 each, 1 observation)

7. UI shows:
   "👁️ Learned 3 new patterns from your changes"
   [View patterns]