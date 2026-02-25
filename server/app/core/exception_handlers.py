from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.exceptions.project_exception import *
from app.exceptions.task_exception import *


def register_exception_handlers(app):

    # -----------------------------
    # Domain Exception Handler
    # -----------------------------
    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException):

        # Map domain types to HTTP codes
        status_code_map = {
            ProjectNotFoundError: status.HTTP_404_NOT_FOUND,
            TaskNotFoundError: status.HTTP_404_NOT_FOUND,
            UserNotFoundError: status.HTTP_404_NOT_FOUND,
            NotProjectMemberError: status.HTTP_403_FORBIDDEN,
            PermissionDeniedError: status.HTTP_403_FORBIDDEN,
            UserAlreadyMemberError: status.HTTP_409_CONFLICT,
            CannotRemoveOwnerError: status.HTTP_400_BAD_REQUEST,
            CannotRemoveLastAdminError: status.HTTP_400_BAD_REQUEST,
            MemberRemovalFailedError: status.HTTP_500_INTERNAL_SERVER_ERROR,
            InvalidTaskUpdateError: status.HTTP_400_BAD_REQUEST,
        }

        status_code = status_code_map.get(type(exc), status.HTTP_400_BAD_REQUEST)

        return JSONResponse(
            status_code=status_code,
            content={
                "error": type(exc).__name__,
                "detail": exc.message,
            },
        )

    # -----------------------------
    # Validation Errors
    # -----------------------------
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "ValidationError",
                "detail": exc.errors(),
            },
        )

    # -----------------------------
    # Unhandled Exceptions
    # -----------------------------
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "detail": "An unexpected error occurred",
            },
        )