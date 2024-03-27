"""
Django settings for Transcendence project.

Generated by 'django-admin startproject' using Django 5.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path

# ----------.env------------ #

import os
import dotenv

dotenv.load_dotenv()

REQUIRED_ENV_VARIABLES = ['DJANGO_PROTOCOL', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'DATABASE_HOST_NAME', 'DATABASE_PORT', 'API_CLIENT_ID', 'API_CLIENT_SECRET', 'API_CONNECT_URL', 'API_TOKEN_URL', 'API_INFO_URL']

# Checking for the existence of environment variables.
for env_variable in REQUIRED_ENV_VARIABLES:
    if env_variable not in os.environ:
        raise Exception(f"The environment variable {env_variable} is missing. Make sure to define it in your .env file.")

DJANGO_PROTOCOL = os.environ['DJANGO_PROTOCOL']
POSTGRES_DB = os.environ['POSTGRES_DB']
POSTGRES_USER = os.environ['POSTGRES_USER']
POSTGRES_PASSWORD = os.environ['POSTGRES_PASSWORD']
DATABASE_HOST_NAME = os.environ['DATABASE_HOST_NAME']
DATABASE_PORT = os.environ['DATABASE_PORT']
API_CLIENT_ID = os.environ['API_CLIENT_ID']
API_CLIENT_SECRET = os.environ['API_CLIENT_SECRET']
API_CONNECT_URL = os.environ['API_CONNECT_URL']
API_TOKEN_URL = os.environ['API_TOKEN_URL']
API_INFO_URL = os.environ['API_INFO_URL']

# -------------------------- #

# SECURE_SSL_REDIRECT = True

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

IS_SEARCHING = False

LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'default': {
                'format': '[DJANGO] %(levelname)s %(asctime)s %(module)s '
                          '%(name)s.%(funcName)s:%(lineno)s: %(message)s'
            },
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'default',
            }
        },
        'loggers': {
            '*': {
                'handlers': ['console'],
                'level': 'DEBUG',
                'propagate': True,
            }
        },
    }
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-w&_9mvz-c1j$w_#z9(e_pd*@dsvpw)&1do9_#9@@2z(xmjehur'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    '*',
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'channels',
    'rest_framework',
    'corsheaders',
    'users.apps.UsersConfig',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://*',
    'https://*',
    'http://127.0.0.1:443',
    'http://localhost:443',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://*',
    'https://*',
    # Add other trusted origins if needed
]

CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Transcendence.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Transcendence.wsgi.application'
ASGI_APPLICATION = 'Transcendence.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': POSTGRES_DB,
        'USER': POSTGRES_USER,
        'PASSWORD': POSTGRES_PASSWORD,
        'HOST': DATABASE_HOST_NAME,
        'PORT': DATABASE_PORT,
    }
}

AUTH_USER_MODEL = 'users.AppUser'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static/'

# Media files

MEDIA_ROOT = BASE_DIR / 'media/'
MEDIA_URL = 'media/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Niveau de journalisation par défaut

