import pytest

from backend.user.services.avatar import MAX_AVATAR_BYTES, set_avatar, sniff_type

from backend.user.schemas.auth import Credentials, RegisterRequest

from backend.user.services.auth import authenticate, create_token, hash_password, read_token, register, verify_password


def test_hash_is_salted_and_verifies():
    a, b = hash_password("correct horse"), hash_password("correct horse")
    assert a != b
    assert verify_password("correct horse", a)
    assert not verify_password("wrong", a)


def test_token_round_trip_and_tamper():
    token = create_token(7)
    assert read_token(token) == 7
    assert read_token(token[:-2] + "xx") is None
    assert read_token("garbage") is None

# TODO 16: register/authenticate against a real session (use a throwaway schema or transaction rollback):
# duplicate email, case-insensitive email, unknown email vs wrong password both give None.


@pytest.mark.parametrize("password", ["password123", "PASSWORD123!", "Password!!!!", "Password1234", "Pa1!"])
def test_register_rejects_weak_passwords(password):
    with pytest.raises(ValueError):
        RegisterRequest(email="a@x.com", username="sam", password=password)


def test_register_accepts_strong_password_and_login_stays_lenient():
    assert RegisterRequest(email="a@x.com", username="sam", password="Str0ng!pass").password == "Str0ng!pass"
    Credentials(email="a@x.com", password="password123")  # login must not apply the strength rules


PNG = bytes.fromhex("89504e470d0a1a0a") + b"rest"
JPEG = bytes.fromhex("ffd8ff") + b"rest"
WEBP = b"RIFF\x00\x00\x00\x00WEBPrest"


def test_sniff_type_uses_the_bytes_not_the_name():
    assert [sniff_type(PNG), sniff_type(JPEG), sniff_type(WEBP)] == ["image/png", "image/jpeg", "image/webp"]
    assert sniff_type(b"GIF89a....") is None
    assert sniff_type(b"<svg onload=alert(1)>") is None


@pytest.mark.parametrize("data", [b"", b"not an image", "too big"], ids=["empty", "not an image", "too big"])
def test_set_avatar_rejects_bad_files_before_touching_the_db(data):
    if data == "too big":
        data = PNG + bytes(MAX_AVATAR_BYTES)
    with pytest.raises(ValueError):
        set_avatar(None, None, data)


@pytest.mark.parametrize("name", ["ab", "a" * 21, "has space", "bad-dash", "émile", ""])
def test_username_rules_reject(name):
    with pytest.raises(ValueError):
        RegisterRequest(email="a@x.com", username=name, password="Str0ng!pass")


@pytest.mark.parametrize("name", ["abc", "Sam_99", "a" * 20])
def test_username_rules_accept(name):
    assert RegisterRequest(email="a@x.com", username=name, password="Str0ng!pass").username == name
