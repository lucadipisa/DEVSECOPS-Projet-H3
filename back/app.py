from flask import Flask, request, Response, make_response
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, expose_headers='X-Total-Items')

# Chargement des données CSV
data = pd.read_csv('logements-et-logements-sociaux-dans-les-departements.csv', sep=',')
data = data.replace({pd.NaT: None})

# ERROR
@app.errorhandler(400)
def bad_request(error):
    response = make_response({'error': error}, 400)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.errorhandler(404)
def not_found(error):
    response = make_response({'error': 'Not found'}, 404)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.errorhandler(500)
def internal_server_error(error):
    response = make_response({'error': 'Internal Server Error'}, 500)
    response.headers['Content-Type'] = 'application/json'
    return response

# Variable globale pour stocker les données filtrées
filtered_data = data.copy()

def apply_filters(data, filters):
    # Travail sur une copie des données
    filtered = data.copy()

    for key, value in filters.items():
        print(f"La recherche va s'effectuer sur ces filtres : '{filters}'.")
        if key == 'densiteMax' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['densite_de_population_au_km2'] <= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'densiteMax' n'est pas un nombre entier valide.")
        
        if key == 'densiteMin' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['densite_de_population_au_km2'] >= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'densiteMin' n'est pas un nombre entier valide.")
        
        elif key == 'region' and (value != '' or value is not None):
            if 'nom_region' in filtered.columns:
                filtered = filtered[filtered['nom_region'].str.lower() == value.lower()]
        
        elif key == 'department' and (value != '' or value is not None):
            if 'nom_departement' in filtered.columns:
                filtered = filtered[filtered['nom_departement'].str.lower() == value.lower()]
        
        elif key == 'populationMax' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['nombre_d_habitants'] <= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'populationMax' n'est pas un nombre entier valide.")
        
        elif key == 'populationMin' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['nombre_d_habitants'] >= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'populationMin' n'est pas un nombre entier valide.")
        
        elif key == 'housingMax' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['nombre_de_logements'] <= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'housingMax' n'est pas un nombre entier valide.")
        
        elif key == 'housingMin' and (value != '' or value is not None):
            try:
                value = int(value)
                filtered = filtered[filtered['nombre_de_logements'] >= value]
            except (ValueError, TypeError):
                # Gérer le cas où la conversion en entier échoue
                print(f"La valeur '{value}' pour 'housingMin' n'est pas un nombre entier valide.")

    return filtered

# Route pour récupérer toutes les données
@app.route('/api/data', methods=['GET'])
def get_data():
    page = int(request.args.get('page', 0))
    items_per_page = int(request.args.get('itemsPerPage', 30))

    start_index = page * items_per_page
    end_index = start_index + items_per_page

    paginated_data = data.iloc[start_index:end_index].to_json(orient="records")
    
    return Response(paginated_data, mimetype='application/json')

# Route de recherche (par densité, par région, par département, nombre d'habitants et nombre de logements)
@app.route('/api/search', methods=['GET'])
def search_data():
    global filtered_data
    
    # Récupérer les paramètres de requête
    filters = {key: request.args.get(key) for key in ['densiteMax', 'densiteMin', 'region', 'department', 'populationMax', 'populationMin', 'housingMax', 'housingMin']}
    # Filtrer les clés avec des valeurs non nulles
    filtered_filters = {key: value for key, value in filters.items() if value is not None or value == ''}

    # Appliquer les filtres aux données globales si des filtres sont spécifiés
    if any(filtered_filters.values()):
        filtered_data = apply_filters(data, filtered_filters)
    else:
        # Aucun filtre spécifié, utiliser les données globales
        filtered_data = data.copy()

    total_items = len(filtered_data)
    
    # Pagination des résultats de recherche
    page = int(request.args.get('page', 0))
    items_per_page = 30

    start_index = page * items_per_page
    end_index = start_index + items_per_page

    paginated_data = filtered_data.iloc[start_index:end_index].to_json(orient="records")

    response = Response(paginated_data, mimetype='application/json')
    response.headers['x-total-items'] = total_items
    # Données filtrées et paginées
    return response

# Stats
# Méthode qui va calculer les statistiques de la population par région et par année
@app.route('/api/stats/population', methods=['GET'])
def get_population_stats():
    global filtered_data
    
    selected_year = request.args.get('year')
    if selected_year:
        population_stats = filtered_data[filtered_data['annee_publication'] == int(selected_year)].groupby(['annee_publication', 'nom_region'])['nombre_d_habitants'].sum().reset_index()
    else :
        return bad_request('Year not provided')
    
    population_stats = population_stats.rename(columns={'nombre_d_habitants': 'total_population'})

    return Response(population_stats.to_json(orient="records"), mimetype='application/json')

# Méthode qui va calculer les statistiques de chômage par région et par année
@app.route('/api/stats/unemployment', methods=['GET'])
def get_unemployment_stats():
    global filtered_data
    
    selected_year = request.args.get('year')
    if selected_year:
        unemployment_stats = filtered_data[filtered_data['annee_publication'] == int(selected_year)].groupby(['annee_publication', 'nom_region'])['taux_de_chomage_au_t4_en'].mean().reset_index()
    else :
        return bad_request('Year not provided')
    
    unemployment_stats = unemployment_stats.rename(columns={'taux_de_chomage_au_t4_en': 'average_unemployment_rate'})

    return Response(unemployment_stats.to_json(orient="records"), mimetype='application/json')

# Méthode qui va calculer les statistiques de construction par région et par année
@app.route('/api/stats/construction', methods=['GET'])
def get_construction_stats():
    global filtered_data
    
    selected_year = request.args.get('year')
    if selected_year:
        construction_stats = filtered_data[filtered_data['annee_publication'] == int(selected_year)].groupby(['annee_publication', 'nom_region'])['moyenne_annuelle_de_la_construction_neuve_sur_10_ans'].mean().reset_index()
    else :
        return bad_request('Year not provided')
    
    construction_stats = construction_stats.rename(columns={'moyenne_annuelle_de_la_construction_neuve_sur_10_ans': 'average_construction_rate'})

    return Response(construction_stats.to_json(orient="records"), mimetype='application/json')


if __name__ == '__main__':
    app.run(debug=True)
