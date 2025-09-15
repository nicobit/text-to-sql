import os, json
from .env_provider         import EnvProvider
from .keyvault_provider    import KeyVaultProvider
from .multi_kv_provider    import MultiKeyVaultProvider
from .env_kv_provider      import EnvRefKeyVaultProvider
from .chain_provider       import ChainProvider
from .provider_base        import SettingsProvider


def make_provider() -> SettingsProvider:
    """
    Order:
        1) EnvProvider   (always first unless ALLOW_ENV=0)
        2) Provider chosen by SETTINGS_BACKEND
    """
    allow_env = os.getenv("ALLOW_ENV", "1") not in {"0", "false", "no"}

    chain: list[SettingsProvider] = []
    if allow_env:
        chain.append(EnvProvider())

    backend = os.getenv("SETTINGS_BACKEND", "env").lower()

    if backend == "env":
        pass                                            # env only

    elif backend == "keyvault":
        chain.append(KeyVaultProvider(os.environ["KEYVAULT_URL"]))

    elif backend == "multikv":
        chain.append(
            MultiKeyVaultProvider(
                vault_map=json.loads(os.environ["KV_URLS"]),
                default_alias=os.getenv("KV_DEFAULT"),
            )
        )

    elif backend == "envkv":
        chain.append(
            EnvRefKeyVaultProvider(
                vault_url=os.environ["KEYVAULT_URL"],
                env_suffix=os.getenv("KV_ENV_SUFFIX", "_SECRET"),
            )
        )
    else:
        raise ValueError(f"Unknown SETTINGS_BACKEND={backend!r}")

    return chain[0] if len(chain) == 1 else ChainProvider(chain)
