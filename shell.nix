{
  composer ? null,
  phpWithExtensions ? null,
  pkgs ? import <nixpkgs> {},
}:
with pkgs;
  mkShell rec {
    buildInputs = [
      alejandra
      composer
      bun
      phpWithExtensions
    ];

    shellHook = ''
      PATH="$PATH:${pkgs.docker-compose}/libexec/docker/cli-plugins"
    '';
  }
