/**
 * Definition class for the Magnolia link plugin button.
 */
export class MgnlLinkButtonDefinition {
	private label: string;
	private icon: string;
	private workspace: string;
	private path: string;

	constructor( label: string, icon: string, workspace: string, path: string ) {
		this.label = label;
		this.icon = icon;
		this.workspace = workspace;
		this.path = path;
	}
	public getLabel(): string {
		return this.label;
	}

	public getIcon(): string {
		return this.icon;
	}

	public getWorkspace(): string {
		return this.workspace;
	}

	public setWorkspace( workspace: string ): void {
		this.workspace = workspace;
	}

	public getPath(): string {
		return this.path;
	}

	public setPath( path: string ): void {
		this.path = path;
	}
}
