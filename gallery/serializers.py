from rest_framework import serializers
from .models import Album, Photo
from taggit.serializers import TagListSerializerField, TaggitSerializer

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'owner', 'name', 'description', 'created_at']

class PhotoSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField()
    
    class Meta:
        model = Photo
        fields = ['id', 'album', 'title', 'description', 'image', 'thumbnail', 'tags', 'uploaded_at']