from django.db import models

class Movies(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.TextField()
    year = models.TextField()
    genre = models.TextField()
    director = models.TextField()

    def __unicode__(self):
        return self.title

    class Meta:
        managed = True
        db_table = 'movies'
