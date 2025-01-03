from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

# Database bağlantısı
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="SE307-TermProject",
            user="postgres",
            password="663732"
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


@app.route('/add-author', methods=['POST'])
def add_author():
    try:
        data = request.get_json()
        name = data.get('name')
        if not name:  # Eksik değer kontrolü
            return jsonify({"error": "Author name is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO author (name) VALUES (%s)", (name,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Author added successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add-institute', methods=['POST'])
def add_institute():
    try:
        # Gelen JSON verisini al
        data = request.get_json()
        name = data.get('name')

        # Gelen veri boşsa hata döndür
        if not name:
            return jsonify({"error": "Institute name is required"}), 400

        # Veritabanı bağlantısını aç
        conn = get_db_connection()
        cursor = conn.cursor()

        # Veriyi veritabanına ekle
        cursor.execute("INSERT INTO institute (name) VALUES (%s)", (name,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Institute added successfully!"})
    except Exception as e:
        # Hata durumunda hata mesajını döndür
        print(f"Error in /add-institute: {e}")  # Terminale hatayı logla
        return jsonify({"error": str(e)}), 500

@app.route('/add-university', methods=['POST'])
def add_university():
    try:
        data = request.get_json()
        name = data.get('name')

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO university (name) VALUES (%s)", (name,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "University added successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Tez Listeleme
@app.route('/theses', methods=['GET'])
def get_theses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                t.thesisid,
                t.title,
                t.abstract,
                a.name AS authorname,
                t.year,
                t.type,
                u.name AS universityname,
                i.name AS institutename,
                t.numberofpages,
                t.language,
                t.submissiondate
            FROM 
                thesis t
            LEFT JOIN author a ON t.authorid = a.authorid
            LEFT JOIN university u ON t.universityid = u.universityid
            LEFT JOIN institute i ON t.instituteid = i.instituteid
        """)
        theses = cursor.fetchall()
        cursor.close()
        conn.close()

        # Veriyi JSON formatına dönüştür
        result = [
            {
                "thesisid": row[0],
                "title": row[1],
                "abstract": row[2],
                "authorname": row[3],
                "year": row[4],
                "type": row[5],
                "universityname": row[6],
                "institutename": row[7],
                "numberofpages": row[8],
                "language": row[9],
                "submissiondate": row[10]
            } for row in theses
        ]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Tez Ekleme
@app.route('/add-thesis', methods=['POST'])
def add_thesis():
    try:
        data = request.get_json()
        allowed_languages = [
            "English", "Turkish", "French", "Spanish", "German",
            "Chinese", "Japanese", "Russian", "Arabic", "Portuguese",
            "Italian", "Hindi", "Korean"
        ]
        
        # Language doğrulama
        if data['language'] not in allowed_languages:
            return jsonify({"error": f"Invalid language. Allowed values are: {', '.join(allowed_languages)}"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO thesis (title, abstract, authorid, year, type, universityid, instituteid, numberofpages, language, submissiondate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (data['title'], data.get('abstract', ''), data['authorid'], data['year'], data['type'],
              data['universityid'], data['instituteid'], data.get('numberofpages', None),
              data['language'], data['submissiondate']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Thesis added successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Tez Güncelleme
@app.route('/update-thesis/<int:thesisid>', methods=['PUT'])
def update_thesis(thesisid):
    try:
        data = request.get_json()
        allowed_languages = [
            "English", "Turkish", "French", "Spanish", "German",
            "Chinese", "Japanese", "Russian", "Arabic", "Portuguese",
            "Italian", "Hindi", "Korean"
        ]
        
        # Language doğrulama
        if data['language'] not in allowed_languages:
            return jsonify({"error": f"Invalid language. Allowed values are: {', '.join(allowed_languages)}"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE thesis 
            SET title = %s, abstract = %s, authorid = %s, year = %s, type = %s,
                universityid = %s, instituteid = %s, numberofpages = %s, language = %s, submissiondate = %s
            WHERE thesisid = %s
        """, (data['title'], data.get('abstract', ''), data['authorid'], data['year'], data['type'],
              data['universityid'], data['instituteid'], data.get('numberofpages', None),
              data['language'], data['submissiondate'], thesisid))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"Thesis with ID {thesisid} updated successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Tez Silme
@app.route('/delete-thesis/<int:thesisid>', methods=['DELETE'])
def delete_thesis(thesisid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Bağımlılıkları sil
        cursor.execute("DELETE FROM thesissubject WHERE thesisid = %s", (thesisid,))
        cursor.execute("DELETE FROM thesiskeyword WHERE thesisid = %s", (thesisid,))
        cursor.execute("DELETE FROM thesissupervisor WHERE thesisid = %s", (thesisid,))

        # Tezi sil
        cursor.execute("DELETE FROM thesis WHERE thesisid = %s", (thesisid,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"Thesis with ID {thesisid} deleted successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Yazarları Listeleme
@app.route('/authors', methods=['GET'])
def get_authors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT authorid, name FROM author")
        authors = cursor.fetchall()
        cursor.close()
        conn.close()

        result = [{"authorid": author[0], "name": author[1]} for author in authors]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/universities', methods=['GET'])
def get_universities():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT universityid, name FROM university")
        universities = cursor.fetchall()
        cursor.close()
        conn.close()

        result = [{"universityid": university[0], "name": university[1]} for university in universities]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-university/<int:universityid>', methods=['DELETE'])
def delete_university(universityid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM university WHERE universityid = %s", (universityid,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"University with ID {universityid} deleted successfully!"})
    except Exception as e:
        print(f"Error deleting university: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-institute/<int:instituteid>', methods=['DELETE'])
def delete_institute(instituteid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM institute WHERE instituteid = %s", (instituteid,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"Institute with ID {instituteid} deleted successfully!"})
    except Exception as e:
        print(f"Error deleting institute: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-author/<int:authorid>', methods=['DELETE'])
def delete_author(authorid):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM author WHERE authorid = %s", (authorid,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"Author with ID {authorid} deleted successfully!"})
    except Exception as e:
        print(f"Error deleting author: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/search-theses', methods=['POST'])
def search_theses():
    try:
        data = request.get_json()
        author = data.get('author')  # Author ID
        keywords = data.get('keywords')  # Keywords
        year = data.get('year')  # Year
        thesis_type = data.get('type')  # Thesis type

        # Dinamik sorgu oluştur
        query = """
            SELECT 
                t.thesisid,
                t.title,
                t.abstract,
                a.name AS authorname,
                t.year,
                t.type,
                u.name AS universityname,
                i.name AS institutename,
                t.numberofpages,
                t.language,
                t.submissiondate
            FROM 
                thesis t
            LEFT JOIN author a ON t.authorid = a.authorid
            LEFT JOIN university u ON t.universityid = u.universityid
            LEFT JOIN institute i ON t.instituteid = i.instituteid
            WHERE 1=1
        """

        params = []

        # Kriterlere göre sorguya filtre ekle
        if author:
            query += " AND t.authorid = %s"
            params.append(author)
        if keywords:
            query += " AND (t.title ILIKE %s OR t.abstract ILIKE %s)"
            keyword_filter = f"%{keywords}%"
            params.extend([keyword_filter, keyword_filter])
        if year:
            query += " AND t.year = %s"
            params.append(year)
        if thesis_type:
            query += " AND t.type = %s"
            params.append(thesis_type)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        theses = cursor.fetchall()
        cursor.close()
        conn.close()

        # Veriyi JSON formatına dönüştür
        result = [
            {
                "thesisid": row[0],
                "title": row[1],
                "abstract": row[2],
                "authorname": row[3],
                "year": row[4],
                "type": row[5],
                "universityname": row[6],
                "institutename": row[7],
                "numberofpages": row[8],
                "language": row[9],
                "submissiondate": row[10]
            } for row in theses
        ]

        return jsonify(result)
    except Exception as e:
        print(f"Error in /search-theses: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/institutes', methods=['GET'])
def get_institutes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT instituteid, name FROM institute")
        institutes = cursor.fetchall()
        cursor.close()
        conn.close()

        result = [{"instituteid": institute[0], "name": institute[1]} for institute in institutes]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)