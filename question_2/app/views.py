from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from models import Movies
import json

def index(request):
    # get all movie data
    movies = Movies.objects.all().order_by('-id')
    return render(request, 'index.html', {'movies': movies})

def project_brief(request):
    # get simple project brief
    return render(request, 'project_brief.html')

# ADD RECORD
@csrf_exempt
def add_movie(request):
    # incoming data
    title = request.POST.get('title', '')
    year = request.POST.get('year', '')
    genre = request.POST.get('genre', '')
    director = request.POST.get('director', '')

    new_movie = Movies(title=title, year=year, genre=genre, director=director)
    new_movie.save()

    # Generate New Record HTML; send back to Front-end
    new_record = Movies.objects.all().order_by('-id')[0]
    movie = {'id': new_record.id, 'title': new_record.title, 'year': new_record.year,
             'genre': new_record.genre, 'director': new_record.director}
    new_record_HTML = render(request, 'new_row.html', {'movie': movie})

    # return as json
    return HttpResponse(json.dumps({'result': '200',
                                    'new_movie': movie}))

# DELETE RECORD
@csrf_exempt
def delete_movie(request, movie_id):
    # delete record
    movie = Movies.objects.filter(id=movie_id)
    movie.delete()

    #return id for Front-end handling
    return HttpResponse(json.dumps({'result': 'ok', 'id': movie_id}))

