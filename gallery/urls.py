from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/home/', views.home_view, name='home'),
    path('api/photos/upload/', views.upload_photo, name='upload_photo'),
    path('api/photos/', views.get_photos, name='get_photos'),
    path('api/photos/<int:photo_id>/delete/', views.delete_photo, name='delete_photo'),
    path('api/albums/', views.albums, name='albums'),
]