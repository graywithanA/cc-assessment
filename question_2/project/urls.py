from django.conf.urls import patterns, url

from app import views

urlpatterns = patterns('',
    # list
    url(r'^$', views.index, name='index'),

    # api docs
    url(r'^docs/project_brief$', views.project_brief, name='project_brief'),

    # api
    url(r'^api/_add$', views.add_movie, name='add_movie'),
    url(r'^api/_delete/(?P<movie_id>\S+)/$', views.delete_movie, name='delete_movie'),

)
