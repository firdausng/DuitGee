class VaultData {
    #current = $state(null);

    get current(){
        return this.#current;
    }

    set current(value: any){
        this.#current = value;
    }
}

export const vaultData = new VaultData();