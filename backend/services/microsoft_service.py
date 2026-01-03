import httpx
from datetime import datetime, timedelta
from urllib.parse import urlencode
from config import get_settings

settings = get_settings()


class MicrosoftService:
    AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    GRAPH_URL = "https://graph.microsoft.com/v1.0"

    SCOPES = [
        "openid",
        "email",
        "profile",
        "offline_access",
        "Mail.Read",
        "Calendars.Read",
        "User.Read",
    ]

    def get_auth_url(self) -> str:
        """Generate Microsoft OAuth authorization URL."""
        params = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "redirect_uri": f"{settings.BACKEND_URL}/api/auth/callback/microsoft",
            "response_type": "code",
            "scope": " ".join(self.SCOPES),
            "response_mode": "query",
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, code: str) -> dict:
        """Exchange authorization code for tokens."""
        with httpx.Client() as client:
            response = client.post(
                self.TOKEN_URL,
                data={
                    "client_id": settings.MICROSOFT_CLIENT_ID,
                    "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{settings.BACKEND_URL}/api/auth/callback/microsoft",
                    "scope": " ".join(self.SCOPES),
                },
            )
            response.raise_for_status()
            data = response.json()

            expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token", ""),
                "expires_at": expires_at.isoformat(),
                "scopes": self.SCOPES,
            }

    def refresh_tokens(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        with httpx.Client() as client:
            response = client.post(
                self.TOKEN_URL,
                data={
                    "client_id": settings.MICROSOFT_CLIENT_ID,
                    "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                    "scope": " ".join(self.SCOPES),
                },
            )
            response.raise_for_status()
            data = response.json()

            expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])

            return {
                "access_token": data["access_token"],
                "expires_at": expires_at.isoformat(),
            }

    def get_user_info(self, access_token: str) -> dict:
        """Get user info from Microsoft Graph."""
        with httpx.Client() as client:
            response = client.get(
                f"{self.GRAPH_URL}/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            data = response.json()

            # Get photo URL if available
            photo_url = None
            try:
                photo_response = client.get(
                    f"{self.GRAPH_URL}/me/photo/$value",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if photo_response.status_code == 200:
                    # Photo is binary, would need to upload elsewhere or use data URL
                    pass
            except Exception:
                pass

            return {
                "email": data.get("mail") or data.get("userPrincipalName"),
                "name": data.get("displayName"),
                "picture": photo_url,
            }

    def fetch_emails(
        self, access_token: str, start_date: str, end_date: str
    ) -> list[dict]:
        """Fetch emails from Outlook for the given date range."""
        emails = []

        with httpx.Client() as client:
            # Filter by received date
            filter_query = f"receivedDateTime ge {start_date}T00:00:00Z and receivedDateTime le {end_date}T23:59:59Z"

            response = client.get(
                f"{self.GRAPH_URL}/me/messages",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "$filter": filter_query,
                    "$select": "id,subject,from,toRecipients,receivedDateTime,bodyPreview",
                    "$top": 50,
                    "$orderby": "receivedDateTime desc",
                },
            )
            response.raise_for_status()
            data = response.json()

            for msg in data.get("value", []):
                from_addr = msg.get("from", {}).get("emailAddress", {})
                to_addrs = msg.get("toRecipients", [])

                emails.append({
                    "id": msg["id"],
                    "subject": msg.get("subject", ""),
                    "from": f"{from_addr.get('name', '')} <{from_addr.get('address', '')}>",
                    "to": ", ".join(
                        f"{r.get('emailAddress', {}).get('name', '')} <{r.get('emailAddress', {}).get('address', '')}>"
                        for r in to_addrs
                    ),
                    "date": msg.get("receivedDateTime", ""),
                    "snippet": msg.get("bodyPreview", ""),
                })

        return emails

    def fetch_calendar_events(
        self, access_token: str, start_date: str, end_date: str
    ) -> list[dict]:
        """Fetch calendar events for the given date range."""
        events = []

        with httpx.Client() as client:
            response = client.get(
                f"{self.GRAPH_URL}/me/calendarView",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "startDateTime": f"{start_date}T00:00:00Z",
                    "endDateTime": f"{end_date}T23:59:59Z",
                    "$select": "id,subject,body,start,end,attendees,location",
                    "$top": 100,
                    "$orderby": "start/dateTime",
                },
            )
            response.raise_for_status()
            data = response.json()

            for event in data.get("value", []):
                attendees = event.get("attendees", [])

                events.append({
                    "id": event["id"],
                    "summary": event.get("subject", ""),
                    "description": event.get("body", {}).get("content", ""),
                    "start": event.get("start", {}).get("dateTime"),
                    "end": event.get("end", {}).get("dateTime"),
                    "attendees": [
                        {
                            "email": a.get("emailAddress", {}).get("address"),
                            "name": a.get("emailAddress", {}).get("name"),
                        }
                        for a in attendees
                    ],
                    "location": event.get("location", {}).get("displayName"),
                })

        return events
