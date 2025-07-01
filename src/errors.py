from flask import Blueprint, render_template

errors_bp = Blueprint('errors', __name__, url_prefix='/api/errors')


@errors_bp.route('/404')
def error_404_handler():
    return render_template('error/404.html'), 404

@errors_bp.route('/401')
def error_401_handler():
    return render_template('error/401.html'), 401
