from django.db import models

from django.db import models
from django.contrib.auth.models import User
from taggit.managers import TaggableManager

class Album(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Photo(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='photos/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True)
    tags = TaggableManager()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
